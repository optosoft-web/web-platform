"use server";

import { z } from "zod";
import { and, count, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import db from "@/server/database/index";
import {
    patientTable,
    prescriptionTable,
    opticalShopTable,
    patientOpticalShops,
    teamMemberTable,
    teamMemberOpticalShopTable,
} from "@/server/database/tables";
import { authMiddleware, createAction } from "@/lib/safe-action";

// ── Helper: Get permitted optical shop IDs for a member ──

async function getMemberPermittedShopIds(userId: string): Promise<string[]> {
    const membership = await db
        .select({ id: teamMemberTable.id })
        .from(teamMemberTable)
        .where(eq(teamMemberTable.memberUserId, userId))
        .limit(1);

    if (membership.length === 0) return [];

    const shops = await db
        .select({ opticalShopId: teamMemberOpticalShopTable.opticalShopId })
        .from(teamMemberOpticalShopTable)
        .where(eq(teamMemberOpticalShopTable.teamMemberId, membership[0].id));

    return shops.map((s) => s.opticalShopId);
}

// ── Get prescriptions for a member (read-only, only permitted shops) ──

const memberGetPrescriptionsSchema = z.object({
    limit: z.number().min(1).max(100).default(20),
    offset: z.number().min(0).default(0),
    search: z.string().optional(),
});

export const ActionMemberGetPrescriptions = createAction
    .inputSchema(memberGetPrescriptionsSchema)
    .use(authMiddleware)
    .action(async ({ parsedInput, ctx }) => {
        try {
            const shopIds = await getMemberPermittedShopIds(ctx.user.id);
            if (shopIds.length === 0) return { data: [], totalCount: 0 };

            const conditions = [inArray(prescriptionTable.opticalShopId, shopIds)];

            if (parsedInput.search && parsedInput.search.trim().length > 0) {
                conditions.push(
                    ilike(patientTable.fullName, `%${parsedInput.search.trim()}%`)
                );
            }

            const prescriptions = await db
                .select({
                    id: prescriptionTable.id,
                    patientId: prescriptionTable.patientId,
                    patientName: patientTable.fullName,
                    opticalShopId: prescriptionTable.opticalShopId,
                    opticalShopName: opticalShopTable.name,
                    rightEyeSpherical: prescriptionTable.rightEyeSpherical,
                    rightEyeCylindrical: prescriptionTable.rightEyeCylindrical,
                    rightEyeAxis: prescriptionTable.rightEyeAxis,
                    leftEyeSpherical: prescriptionTable.leftEyeSpherical,
                    leftEyeCylindrical: prescriptionTable.leftEyeCylindrical,
                    leftEyeAxis: prescriptionTable.leftEyeAxis,
                    addition: prescriptionTable.addition,
                    prescribedBy: prescriptionTable.prescribedBy,
                    prescriptionDate: prescriptionTable.prescriptionDate,
                    createdAt: prescriptionTable.createdAt,
                })
                .from(prescriptionTable)
                .innerJoin(patientTable, eq(prescriptionTable.patientId, patientTable.id))
                .innerJoin(
                    opticalShopTable,
                    eq(prescriptionTable.opticalShopId, opticalShopTable.id)
                )
                .where(and(...conditions))
                .orderBy(desc(prescriptionTable.createdAt))
                .limit(parsedInput.limit)
                .offset(parsedInput.offset);

            const [{ total }] = await db
                .select({ total: count() })
                .from(prescriptionTable)
                .innerJoin(patientTable, eq(prescriptionTable.patientId, patientTable.id))
                .where(and(...conditions));

            return { data: prescriptions, totalCount: total };
        } catch (error) {
            console.error("Erro ao buscar receitas (membro):", error);
            throw new Error("Não foi possível buscar as receitas.");
        }
    });

// ── Get prescription detail for a member (read-only) ──

const memberGetPrescriptionByIdSchema = z.object({
    id: z.string().uuid(),
});

export const ActionMemberGetPrescriptionById = createAction
    .inputSchema(memberGetPrescriptionByIdSchema)
    .use(authMiddleware)
    .action(async ({ parsedInput, ctx }) => {
        try {
            const shopIds = await getMemberPermittedShopIds(ctx.user.id);
            if (shopIds.length === 0) throw new Error("Sem permissão.");

            const [result] = await db
                .select({
                    id: prescriptionTable.id,
                    patientId: prescriptionTable.patientId,
                    patientName: patientTable.fullName,
                    patientPhone: patientTable.phone,
                    patientCpf: patientTable.cpf,
                    patientRg: patientTable.rg,
                    opticalShopId: prescriptionTable.opticalShopId,
                    opticalShopName: opticalShopTable.name,
                    rightEyeSpherical: prescriptionTable.rightEyeSpherical,
                    rightEyeCylindrical: prescriptionTable.rightEyeCylindrical,
                    rightEyeAxis: prescriptionTable.rightEyeAxis,
                    leftEyeSpherical: prescriptionTable.leftEyeSpherical,
                    leftEyeCylindrical: prescriptionTable.leftEyeCylindrical,
                    leftEyeAxis: prescriptionTable.leftEyeAxis,
                    addition: prescriptionTable.addition,
                    dnpRight: prescriptionTable.dnpRight,
                    dnpLeft: prescriptionTable.dnpLeft,
                    notes: prescriptionTable.notes,
                    prescribedBy: prescriptionTable.prescribedBy,
                    prescriptionDate: prescriptionTable.prescriptionDate,
                    createdAt: prescriptionTable.createdAt,
                })
                .from(prescriptionTable)
                .innerJoin(patientTable, eq(prescriptionTable.patientId, patientTable.id))
                .innerJoin(
                    opticalShopTable,
                    eq(prescriptionTable.opticalShopId, opticalShopTable.id)
                )
                .where(
                    and(
                        eq(prescriptionTable.id, parsedInput.id),
                        inArray(prescriptionTable.opticalShopId, shopIds)
                    )
                )
                .limit(1);

            if (!result) throw new Error("Receita não encontrada ou sem permissão.");
            return result;
        } catch (error) {
            console.error("Erro ao buscar receita (membro):", error);
            throw new Error("Não foi possível buscar a receita.");
        }
    });

// ── Get patients for a member (view + edit, only for permitted shops) ──

const memberGetPatientsSchema = z.object({
    limit: z.number().min(1).max(100).default(20),
    offset: z.number().min(0).default(0),
    search: z.string().optional(),
});

export const ActionMemberGetPatients = createAction
    .inputSchema(memberGetPatientsSchema)
    .use(authMiddleware)
    .action(async ({ parsedInput, ctx }) => {
        try {
            const shopIds = await getMemberPermittedShopIds(ctx.user.id);
            if (shopIds.length === 0) return { data: [], totalCount: 0 };

            // Get patients that belong to the member's permitted shops
            const conditions = [inArray(patientOpticalShops.opticalShopId, shopIds)];

            if (parsedInput.search && parsedInput.search.trim().length > 0) {
                const q = `%${parsedInput.search.trim()}%`;
                conditions.push(
                    or(
                        ilike(patientTable.fullName, q),
                        ilike(patientTable.phone, q),
                        ilike(patientTable.cpf, q)
                    )!
                );
            }

            const patients = await db
                .selectDistinctOn([patientTable.id], {
                    id: patientTable.id,
                    fullName: patientTable.fullName,
                    phone: patientTable.phone,
                    cpf: patientTable.cpf,
                    dateOfBirth: patientTable.dateOfBirth,
                    createdAt: patientTable.createdAt,
                    prescriptionCount: sql<number>`(
                        SELECT COUNT(*) FROM ${prescriptionTable}
                        WHERE ${prescriptionTable.patientId} = ${patientTable.id}
                        AND ${prescriptionTable.opticalShopId} IN (${sql.join(
                        shopIds.map((id) => sql`${id}`),
                        sql`, `
                    )})
                    )`.mapWith(Number),
                    lastPrescriptionDate: sql<string | null>`(
                        SELECT MAX(${prescriptionTable.prescriptionDate})
                        FROM ${prescriptionTable}
                        WHERE ${prescriptionTable.patientId} = ${patientTable.id}
                        AND ${prescriptionTable.opticalShopId} IN (${sql.join(
                        shopIds.map((id) => sql`${id}`),
                        sql`, `
                    )})
                    )`,
                })
                .from(patientTable)
                .innerJoin(
                    patientOpticalShops,
                    eq(patientTable.id, patientOpticalShops.patientId)
                )
                .where(and(...conditions))
                .orderBy(desc(patientTable.createdAt))
                .limit(parsedInput.limit)
                .offset(parsedInput.offset);

            // Count total distinct patients
            const totalResult = await db
                .selectDistinctOn([patientTable.id], {
                    id: patientTable.id,
                })
                .from(patientTable)
                .innerJoin(
                    patientOpticalShops,
                    eq(patientTable.id, patientOpticalShops.patientId)
                )
                .where(and(...conditions));

            // Get optical shops for these patients
            const patientIds = patients.map((p) => p.id);
            let shopsMap: Record<string, { id: string; name: string }[]> = {};

            if (patientIds.length > 0) {
                const shops = await db
                    .select({
                        patientId: patientOpticalShops.patientId,
                        shopId: opticalShopTable.id,
                        shopName: opticalShopTable.name,
                    })
                    .from(patientOpticalShops)
                    .innerJoin(
                        opticalShopTable,
                        eq(patientOpticalShops.opticalShopId, opticalShopTable.id)
                    )
                    .where(
                        and(
                            inArray(patientOpticalShops.patientId, patientIds),
                            inArray(patientOpticalShops.opticalShopId, shopIds)
                        )
                    );

                shopsMap = shops.reduce(
                    (acc, row) => {
                        if (!acc[row.patientId]) acc[row.patientId] = [];
                        acc[row.patientId].push({ id: row.shopId, name: row.shopName });
                        return acc;
                    },
                    {} as Record<string, { id: string; name: string }[]>
                );
            }

            const data = patients.map((p) => ({
                ...p,
                opticalShops: shopsMap[p.id] || [],
            }));

            return { data, totalCount: totalResult.length };
        } catch (error) {
            console.error("Erro ao buscar pacientes (membro):", error);
            throw new Error("Não foi possível buscar os pacientes.");
        }
    });

// ── Get patient details for a member ──

const memberGetPatientDetailSchema = z.object({
    id: z.string().uuid(),
});

export const ActionMemberGetPatientDetail = createAction
    .inputSchema(memberGetPatientDetailSchema)
    .use(authMiddleware)
    .action(async ({ parsedInput, ctx }) => {
        try {
            const shopIds = await getMemberPermittedShopIds(ctx.user.id);
            if (shopIds.length === 0) throw new Error("Sem permissão.");

            // Check that the patient belongs to one of the permitted shops
            const patientShop = await db
                .select({ patientId: patientOpticalShops.patientId })
                .from(patientOpticalShops)
                .where(
                    and(
                        eq(patientOpticalShops.patientId, parsedInput.id),
                        inArray(patientOpticalShops.opticalShopId, shopIds)
                    )
                )
                .limit(1);

            if (patientShop.length === 0) throw new Error("Paciente não encontrado ou sem permissão.");

            const patient = await db.query.patientTable.findFirst({
                where: eq(patientTable.id, parsedInput.id),
                with: {
                    prescriptions: {
                        orderBy: (prescriptions: any, { desc }: any) => [
                            desc(prescriptions.prescriptionDate),
                        ],
                    },
                    patientOpticalShops: {
                        with: {
                            opticalShop: true,
                        },
                    },
                },
            });

            if (!patient) throw new Error("Paciente não encontrado.");
            return patient;
        } catch (error) {
            console.error("Erro ao buscar detalhes do paciente (membro):", error);
            throw new Error("Não foi possível buscar os detalhes do paciente.");
        }
    });

// ── Update patient for a member (only permitted shops) ──

const memberUpdatePatientSchema = z.object({
    id: z.string().uuid(),
    fullName: z.string().min(3, "O nome completo é obrigatório.").optional(),
    phone: z.string().optional(),
    cpf: z.string().optional(),
    rg: z.string().optional(),
    dateOfBirth: z.string().optional(),
    contactInfo: z.string().optional(),
});

export const ActionMemberUpdatePatient = createAction
    .inputSchema(memberUpdatePatientSchema)
    .use(authMiddleware)
    .action(async ({ parsedInput, ctx }) => {
        try {
            const shopIds = await getMemberPermittedShopIds(ctx.user.id);
            if (shopIds.length === 0) throw new Error("Sem permissão.");

            // Verify patient belongs to a permitted shop
            const patientShop = await db
                .select({ patientId: patientOpticalShops.patientId })
                .from(patientOpticalShops)
                .where(
                    and(
                        eq(patientOpticalShops.patientId, parsedInput.id),
                        inArray(patientOpticalShops.opticalShopId, shopIds)
                    )
                )
                .limit(1);

            if (patientShop.length === 0) throw new Error("Paciente não encontrado ou sem permissão.");

            const [updated] = await db
                .update(patientTable)
                .set({
                    fullName: parsedInput.fullName,
                    phone: parsedInput.phone,
                    cpf: parsedInput.cpf,
                    rg: parsedInput.rg,
                    dateOfBirth: parsedInput.dateOfBirth,
                    contactInfo: parsedInput.contactInfo,
                    updatedAt: new Date(),
                })
                .where(eq(patientTable.id, parsedInput.id))
                .returning();

            if (!updated) throw new Error("Paciente não encontrado.");
            return updated;
        } catch (error) {
            console.error("Erro ao atualizar paciente (membro):", error);
            throw new Error("Não foi possível atualizar o paciente.");
        }
    });

// ── Get optical shops the member has access to ──

export const ActionMemberGetMyShops = createAction
    .use(authMiddleware)
    .action(async ({ ctx }) => {
        const shopIds = await getMemberPermittedShopIds(ctx.user.id);
        if (shopIds.length === 0) return [];

        const shops = await db
            .select({ id: opticalShopTable.id, name: opticalShopTable.name })
            .from(opticalShopTable)
            .where(inArray(opticalShopTable.id, shopIds));

        return shops;
    });

// ── Create patient (member) ──

const memberCreatePatientSchema = z.object({
    fullName: z.string().min(3, "O nome completo é obrigatório."),
    dateOfBirth: z.string().optional(),
    contactInfo: z.string().optional(),
    phone: z.string().optional(),
    cpf: z.string().optional(),
    rg: z.string().optional(),
    opticalShopId: z.string().uuid(),
});

export const ActionMemberCreatePatient = createAction
    .inputSchema(memberCreatePatientSchema)
    .use(authMiddleware)
    .action(async ({ parsedInput, ctx }) => {
        const shopIds = await getMemberPermittedShopIds(ctx.user.id);
        if (shopIds.length === 0) throw new Error("Sem permissão.");

        if (!shopIds.includes(parsedInput.opticalShopId)) {
            throw new Error("Sem permissão para esta ótica.");
        }

        // Get the subscription owner's ID from the team member record
        const membership = await db
            .select({ ownerId: teamMemberTable.ownerId })
            .from(teamMemberTable)
            .where(eq(teamMemberTable.memberUserId, ctx.user.id))
            .limit(1);

        if (membership.length === 0) throw new Error("Membro não encontrado.");

        const ownerId = membership[0].ownerId;

        try {
            const newPatient = await db.transaction(async (tx) => {
                const [createdPatient] = await tx
                    .insert(patientTable)
                    .values({
                        userId: ownerId,
                        fullName: parsedInput.fullName,
                        dateOfBirth: parsedInput.dateOfBirth,
                        contactInfo: parsedInput.contactInfo,
                        phone: parsedInput.phone || null,
                        cpf: parsedInput.cpf || null,
                        rg: parsedInput.rg || null,
                    })
                    .returning();

                if (!createdPatient) {
                    tx.rollback();
                    throw new Error("Não foi possível criar o paciente.");
                }

                await tx.insert(patientOpticalShops).values({
                    patientId: createdPatient.id,
                    opticalShopId: parsedInput.opticalShopId,
                });

                return createdPatient;
            });

            return newPatient;
        } catch (error) {
            console.error("Erro ao criar paciente (membro):", error);
            throw new Error("Ocorreu um erro ao salvar o novo paciente.");
        }
    });
