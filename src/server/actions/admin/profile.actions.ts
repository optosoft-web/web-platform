"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import db from "@/server/database/index";
import { profileTable, subscriptionTable } from "@/server/database/tables";
import { authMiddleware, createAction } from "@/lib/safe-action";

// ── Get profile ──

export const ActionGetProfile = createAction
    .use(authMiddleware)
    .action(async ({ ctx }) => {
        try {
            const profile = await db.query.profileTable.findFirst({
                where: eq(profileTable.userId, ctx.user.id),
            });
            return profile ?? null;
        } catch (error) {
            console.error("Erro ao buscar perfil:", error);
            throw new Error("Não foi possível buscar o perfil.");
        }
    });

// ── Update optometrist name ──

const updateProfileSchema = z.object({
    fullName: z.string().max(256).optional(),
    optometristName: z.string().max(256).optional(),
});

export const ActionUpdateProfile = createAction
    .inputSchema(updateProfileSchema)
    .use(authMiddleware)
    .action(async ({ parsedInput, ctx }) => {
        try {
            // Try to update existing profile
            const [updated] = await db
                .update(profileTable)
                .set({
                    fullName: parsedInput.fullName ?? undefined,
                    optometristName: parsedInput.optometristName || null,
                    updatedAt: new Date(),
                })
                .where(eq(profileTable.userId, ctx.user.id))
                .returning();

            if (updated) return updated;

            // Profile doesn't exist yet — create one
            const subscription = await db.query.subscriptionTable.findFirst({
                where: eq(subscriptionTable.userId, ctx.user.id),
            });

            if (!subscription) {
                throw new Error("Assinatura não encontrada. É necessário ter uma assinatura ativa.");
            }

            const [created] = await db
                .insert(profileTable)
                .values({
                    id: ctx.user.id,
                    userId: ctx.user.id,
                    subscriptionId: subscription.id,
                    profileType: "SUBSCRIPTION_OWNER",
                    fullName: parsedInput.fullName || null,
                    optometristName: parsedInput.optometristName || null,
                })
                .returning();

            return created;
        } catch (error) {
            console.error("Erro ao atualizar perfil:", error);
            throw new Error("Não foi possível atualizar o perfil.");
        }
    });
