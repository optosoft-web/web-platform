"use server";

import { z } from "zod";
import { and, asc, eq, inArray } from "drizzle-orm";
import db from "@/server/database/index";
import {
    teamMemberTable,
    teamMemberOpticalShopTable,
    opticalShopTable,
} from "@/server/database/tables";
import { authMiddleware, createAction } from "@/lib/safe-action";
import { supabaseAdmin } from "@/utils/supabase/admin";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const createTeamMemberSchema = z.object({
    fullName: z.string().min(2, "O nome é obrigatório."),
    email: z.string().email("E-mail inválido."),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
    opticalShopIds: z.array(z.string().uuid()).min(1, "Selecione ao menos uma ótica."),
});

const updateTeamMemberSchema = z.object({
    id: z.string().uuid(),
    fullName: z.string().min(2, "O nome é obrigatório."),
    email: z.string().email("E-mail inválido."),
    active: z.boolean(),
    opticalShopIds: z.array(z.string().uuid()).min(1, "Selecione ao menos uma ótica."),
});

const teamMemberIdSchema = z.object({
    id: z.string().uuid(),
});

const toggleActiveSchema = z.object({
    id: z.string().uuid(),
    active: z.boolean(),
});

// ---------------------------------------------------------------------------
// List team members (with optical shop names)
// ---------------------------------------------------------------------------

export const ActionGetTeamMembers = createAction.use(authMiddleware).action(
    async ({ ctx }) => {
        try {
            const members = await db
                .select({
                    id: teamMemberTable.id,
                    fullName: teamMemberTable.fullName,
                    email: teamMemberTable.email,
                    active: teamMemberTable.active,
                    createdAt: teamMemberTable.createdAt,
                })
                .from(teamMemberTable)
                .where(eq(teamMemberTable.ownerId, ctx.user.id))
                .orderBy(asc(teamMemberTable.fullName));

            // Fetch optical shop assignments for each member
            const memberIds = members.map((m) => m.id);

            if (memberIds.length === 0) return [];

            const assignments = await db
                .select({
                    teamMemberId: teamMemberOpticalShopTable.teamMemberId,
                    opticalShopId: teamMemberOpticalShopTable.opticalShopId,
                    opticalShopName: opticalShopTable.name,
                })
                .from(teamMemberOpticalShopTable)
                .innerJoin(
                    opticalShopTable,
                    eq(teamMemberOpticalShopTable.opticalShopId, opticalShopTable.id),
                )
                .where(inArray(teamMemberOpticalShopTable.teamMemberId, memberIds));

            const shopsByMember = new Map<
                string,
                { id: string; name: string }[]
            >();
            for (const a of assignments) {
                const list = shopsByMember.get(a.teamMemberId) ?? [];
                list.push({ id: a.opticalShopId, name: a.opticalShopName });
                shopsByMember.set(a.teamMemberId, list);
            }

            return members.map((m) => ({
                ...m,
                opticalShops: shopsByMember.get(m.id) ?? [],
            }));
        } catch (error) {
            console.error("Erro ao buscar membros da equipe:", error);
            throw new Error("Não foi possível buscar os membros da equipe.");
        }
    },
);

// ---------------------------------------------------------------------------
// Create team member
// ---------------------------------------------------------------------------

export const ActionCreateTeamMember = createAction
    .inputSchema(createTeamMemberSchema)
    .use(authMiddleware)
    .action(async ({ parsedInput, ctx }) => {
        try {
            // 1. Create Supabase auth user with the given email + password
            const { data: authData, error: authError } =
                await supabaseAdmin.auth.admin.createUser({
                    email: parsedInput.email,
                    password: parsedInput.password,
                    email_confirm: true, // auto-confirm so they can log in immediately
                    user_metadata: {
                        full_name: parsedInput.fullName,
                        created_by_owner: ctx.user.id,
                    },
                });

            if (authError) {
                throw new Error(authError.message);
            }

            // 2. Insert the team member row linked to the new auth user
            const [member] = await db
                .insert(teamMemberTable)
                .values({
                    ownerId: ctx.user.id,
                    memberUserId: authData.user.id,
                    fullName: parsedInput.fullName,
                    email: parsedInput.email,
                })
                .returning();

            // 3. Assign optical shops
            if (parsedInput.opticalShopIds.length > 0) {
                await db.insert(teamMemberOpticalShopTable).values(
                    parsedInput.opticalShopIds.map((shopId) => ({
                        teamMemberId: member.id,
                        opticalShopId: shopId,
                    })),
                );
            }

            return member;
        } catch (error) {
            console.error("Erro ao criar membro da equipe:", error);
            if (error instanceof Error) throw error;
            throw new Error("Não foi possível criar o membro da equipe.");
        }
    });

// ---------------------------------------------------------------------------
// Update team member
// ---------------------------------------------------------------------------

export const ActionUpdateTeamMember = createAction
    .inputSchema(updateTeamMemberSchema)
    .use(authMiddleware)
    .action(async ({ parsedInput, ctx }) => {
        try {
            const [updated] = await db
                .update(teamMemberTable)
                .set({
                    fullName: parsedInput.fullName,
                    email: parsedInput.email,
                    active: parsedInput.active,
                    updatedAt: new Date(),
                })
                .where(
                    and(
                        eq(teamMemberTable.id, parsedInput.id),
                        eq(teamMemberTable.ownerId, ctx.user.id),
                    ),
                )
                .returning();

            if (!updated) {
                throw new Error("Membro não encontrado ou acesso negado.");
            }

            // Rebuild optical shop assignments
            await db
                .delete(teamMemberOpticalShopTable)
                .where(eq(teamMemberOpticalShopTable.teamMemberId, parsedInput.id));

            if (parsedInput.opticalShopIds.length > 0) {
                await db.insert(teamMemberOpticalShopTable).values(
                    parsedInput.opticalShopIds.map((shopId) => ({
                        teamMemberId: parsedInput.id,
                        opticalShopId: shopId,
                    })),
                );
            }

            return updated;
        } catch (error) {
            console.error("Erro ao atualizar membro:", error);
            throw new Error("Não foi possível atualizar o membro.");
        }
    });

// ---------------------------------------------------------------------------
// Toggle active status
// ---------------------------------------------------------------------------

export const ActionToggleTeamMemberActive = createAction
    .inputSchema(toggleActiveSchema)
    .use(authMiddleware)
    .action(async ({ parsedInput, ctx }) => {
        try {
            const [updated] = await db
                .update(teamMemberTable)
                .set({
                    active: parsedInput.active,
                    updatedAt: new Date(),
                })
                .where(
                    and(
                        eq(teamMemberTable.id, parsedInput.id),
                        eq(teamMemberTable.ownerId, ctx.user.id),
                    ),
                )
                .returning();

            if (!updated) {
                throw new Error("Membro não encontrado ou acesso negado.");
            }

            return updated;
        } catch (error) {
            console.error("Erro ao alterar status:", error);
            throw new Error("Não foi possível alterar o status do membro.");
        }
    });

// ---------------------------------------------------------------------------
// Delete team member
// ---------------------------------------------------------------------------

export const ActionDeleteTeamMember = createAction
    .inputSchema(teamMemberIdSchema)
    .use(authMiddleware)
    .action(async ({ parsedInput, ctx }) => {
        try {
            // 1. Fetch the member to get the auth user id
            const [deleted] = await db
                .delete(teamMemberTable)
                .where(
                    and(
                        eq(teamMemberTable.id, parsedInput.id),
                        eq(teamMemberTable.ownerId, ctx.user.id),
                    ),
                )
                .returning();

            if (!deleted) {
                throw new Error("Membro não encontrado ou acesso negado.");
            }

            // 2. Delete the Supabase auth user so the email can be reused
            await supabaseAdmin.auth.admin.deleteUser(deleted.memberUserId);

            return { success: true };
        } catch (error) {
            console.error("Erro ao excluir membro:", error);
            throw new Error("Não foi possível excluir o membro.");
        }
    });
