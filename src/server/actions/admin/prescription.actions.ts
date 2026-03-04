"use server";

import { z } from "zod";
import { and, desc, eq, count, ilike } from "drizzle-orm";
import db from "@/server/database/index";
import {
    prescriptionTable,
    patientTable,
    patientOpticalShops,
    opticalShopTable,
} from "@/server/database/tables";
import { authMiddleware, createAction } from "@/lib/safe-action";

// ── Schemas ──────────────────────────────────────────────

const prescriptionValuesSchema = z.object({
    rightEyeSpherical: z.string().optional(),
    rightEyeCylindrical: z.string().optional(),
    rightEyeAxis: z.coerce.number().int().min(0).max(180).optional(),
    leftEyeSpherical: z.string().optional(),
    leftEyeCylindrical: z.string().optional(),
    leftEyeAxis: z.coerce.number().int().min(0).max(180).optional(),
    addition: z.string().optional(),
    dnpRight: z.string().optional(),
    dnpLeft: z.string().optional(),
    notes: z.string().optional(),
    privateNotes: z.string().optional(),
    prescribedBy: z.string().optional(),
    prescriptionDate: z.string().optional(),
});

const createPrescriptionSchema = prescriptionValuesSchema.extend({
    patientId: z.string().uuid(),
    opticalShopId: z.string().uuid(),
});

const createPrescriptionWithNewPatientSchema = prescriptionValuesSchema.extend({
    opticalShopId: z.string().uuid(),
    patientFullName: z.string().min(3, "O nome do paciente é obrigatório."),
    patientPhone: z.string().optional(),
    patientCpf: z.string().optional(),
    patientRg: z.string().optional(),
    patientDateOfBirth: z.string().optional(),
});

// ── Create prescription for EXISTING patient ──

export const ActionCreatePrescription = createAction
    .inputSchema(createPrescriptionSchema)
    .use(authMiddleware)
    .action(async ({ parsedInput, ctx }) => {
        try {
            const patient = await db.query.patientTable.findFirst({
                where: and(
                    eq(patientTable.id, parsedInput.patientId),
                    eq(patientTable.userId, ctx.user.id)
                ),
            });
            if (!patient) throw new Error("Paciente não encontrado.");

            // ensure patient-optical-shop link exists
            const linkExists = await db.query.patientOpticalShops.findFirst({
                where: and(
                    eq(patientOpticalShops.patientId, parsedInput.patientId),
                    eq(patientOpticalShops.opticalShopId, parsedInput.opticalShopId)
                ),
            });
            if (!linkExists) {
                await db.insert(patientOpticalShops).values({
                    patientId: parsedInput.patientId,
                    opticalShopId: parsedInput.opticalShopId,
                });
            }

            const [prescription] = await db
                .insert(prescriptionTable)
                .values({
                    patientId: parsedInput.patientId,
                    userId: ctx.user.id,
                    opticalShopId: parsedInput.opticalShopId,
                    rightEyeSpherical: parsedInput.rightEyeSpherical || null,
                    rightEyeCylindrical: parsedInput.rightEyeCylindrical || null,
                    rightEyeAxis: parsedInput.rightEyeAxis ?? null,
                    leftEyeSpherical: parsedInput.leftEyeSpherical || null,
                    leftEyeCylindrical: parsedInput.leftEyeCylindrical || null,
                    leftEyeAxis: parsedInput.leftEyeAxis ?? null,
                    addition: parsedInput.addition || null,
                    dnpRight: parsedInput.dnpRight || null,
                    dnpLeft: parsedInput.dnpLeft || null,
                    notes: parsedInput.notes || null,
                    privateNotes: parsedInput.privateNotes || null,
                    prescribedBy: parsedInput.prescribedBy || null,
                    prescriptionDate: parsedInput.prescriptionDate || new Date().toISOString().split("T")[0],
                })
                .returning();

            return prescription;
        } catch (error) {
            console.error("Erro ao criar prescrição:", error);
            throw new Error("Não foi possível criar a prescrição.");
        }
    });

// ── Create prescription + NEW patient in one transaction ──

export const ActionCreatePrescriptionWithNewPatient = createAction
    .inputSchema(createPrescriptionWithNewPatientSchema)
    .use(authMiddleware)
    .action(async ({ parsedInput, ctx }) => {
        try {
            return await db.transaction(async (tx) => {
                const [newPatient] = await tx
                    .insert(patientTable)
                    .values({
                        userId: ctx.user.id,
                        fullName: parsedInput.patientFullName,
                        phone: parsedInput.patientPhone || null,
                        cpf: parsedInput.patientCpf || null,
                        rg: parsedInput.patientRg || null,
                        dateOfBirth: parsedInput.patientDateOfBirth || null,
                    })
                    .returning();

                await tx.insert(patientOpticalShops).values({
                    patientId: newPatient.id,
                    opticalShopId: parsedInput.opticalShopId,
                });

                const [prescription] = await tx
                    .insert(prescriptionTable)
                    .values({
                        patientId: newPatient.id,
                        userId: ctx.user.id,
                        opticalShopId: parsedInput.opticalShopId,
                        rightEyeSpherical: parsedInput.rightEyeSpherical || null,
                        rightEyeCylindrical: parsedInput.rightEyeCylindrical || null,
                        rightEyeAxis: parsedInput.rightEyeAxis ?? null,
                        leftEyeSpherical: parsedInput.leftEyeSpherical || null,
                        leftEyeCylindrical: parsedInput.leftEyeCylindrical || null,
                        leftEyeAxis: parsedInput.leftEyeAxis ?? null,
                        addition: parsedInput.addition || null,
                        dnpRight: parsedInput.dnpRight || null,
                        dnpLeft: parsedInput.dnpLeft || null,
                        notes: parsedInput.notes || null,
                        privateNotes: parsedInput.privateNotes || null,
                        prescribedBy: parsedInput.prescribedBy || null,
                        prescriptionDate: parsedInput.prescriptionDate || new Date().toISOString().split("T")[0],
                    })
                    .returning();

                return { patient: newPatient, prescription };
            });
        } catch (error) {
            console.error("Erro ao criar paciente+prescrição:", error);
            throw new Error("Não foi possível criar a prescrição.");
        }
    });

// ── Get prescriptions for an optical shop ──

const getPrescriptionsSchema = z.object({
    opticalShopId: z.string().uuid(),
    limit: z.number().min(1).max(100).default(20),
    offset: z.number().min(0).default(0),
});

export const ActionGetPrescriptions = createAction
    .inputSchema(getPrescriptionsSchema)
    .use(authMiddleware)
    .action(async ({ parsedInput, ctx }) => {
        try {
            const prescriptions = await db
                .select({
                    id: prescriptionTable.id,
                    patientId: prescriptionTable.patientId,
                    patientName: patientTable.fullName,
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
                .where(
                    and(
                        eq(prescriptionTable.opticalShopId, parsedInput.opticalShopId),
                        eq(prescriptionTable.userId, ctx.user.id)
                    )
                )
                .orderBy(desc(prescriptionTable.createdAt))
                .limit(parsedInput.limit)
                .offset(parsedInput.offset);

            const [{ total }] = await db
                .select({ total: count() })
                .from(prescriptionTable)
                .where(
                    and(
                        eq(prescriptionTable.opticalShopId, parsedInput.opticalShopId),
                        eq(prescriptionTable.userId, ctx.user.id)
                    )
                );

            return { data: prescriptions, totalCount: total };
        } catch (error) {
            console.error("Erro ao buscar prescrições:", error);
            throw new Error("Não foi possível buscar as prescrições.");
        }
    });

// ── Get prescription by ID (full detail) ──

const getPrescriptionByIdSchema = z.object({
    id: z.string().uuid(),
});

export const ActionGetPrescriptionById = createAction
    .inputSchema(getPrescriptionByIdSchema)
    .use(authMiddleware)
    .action(async ({ parsedInput, ctx }) => {
        try {
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
                    privateNotes: prescriptionTable.privateNotes,
                    prescribedBy: prescriptionTable.prescribedBy,
                    prescriptionDate: prescriptionTable.prescriptionDate,
                    createdAt: prescriptionTable.createdAt,
                })
                .from(prescriptionTable)
                .innerJoin(patientTable, eq(prescriptionTable.patientId, patientTable.id))
                .innerJoin(opticalShopTable, eq(prescriptionTable.opticalShopId, opticalShopTable.id))
                .where(
                    and(
                        eq(prescriptionTable.id, parsedInput.id),
                        eq(prescriptionTable.userId, ctx.user.id)
                    )
                )
                .limit(1);

            if (!result) throw new Error("Prescrição não encontrada.");
            return result;
        } catch (error) {
            console.error("Erro ao buscar prescrição:", error);
            throw new Error("Não foi possível buscar a prescrição.");
        }
    });

// ── Update prescription ──

const updatePrescriptionSchema = prescriptionValuesSchema.extend({
    id: z.string().uuid(),
});

export const ActionUpdatePrescription = createAction
    .inputSchema(updatePrescriptionSchema)
    .use(authMiddleware)
    .action(async ({ parsedInput, ctx }) => {
        try {
            const [updated] = await db
                .update(prescriptionTable)
                .set({
                    rightEyeSpherical: parsedInput.rightEyeSpherical || null,
                    rightEyeCylindrical: parsedInput.rightEyeCylindrical || null,
                    rightEyeAxis: parsedInput.rightEyeAxis ?? null,
                    leftEyeSpherical: parsedInput.leftEyeSpherical || null,
                    leftEyeCylindrical: parsedInput.leftEyeCylindrical || null,
                    leftEyeAxis: parsedInput.leftEyeAxis ?? null,
                    addition: parsedInput.addition || null,
                    dnpRight: parsedInput.dnpRight || null,
                    dnpLeft: parsedInput.dnpLeft || null,
                    notes: parsedInput.notes || null,
                    privateNotes: parsedInput.privateNotes || null,
                    prescribedBy: parsedInput.prescribedBy || null,
                    prescriptionDate: parsedInput.prescriptionDate || undefined,
                })
                .where(
                    and(
                        eq(prescriptionTable.id, parsedInput.id),
                        eq(prescriptionTable.userId, ctx.user.id)
                    )
                )
                .returning();

            if (!updated) throw new Error("Prescrição não encontrada.");
            return updated;
        } catch (error) {
            console.error("Erro ao atualizar prescrição:", error);
            throw new Error("Não foi possível atualizar a prescrição.");
        }
    });

// ── Delete prescription ──

const deletePrescriptionSchema = z.object({
    id: z.string().uuid(),
});

export const ActionDeletePrescription = createAction
    .inputSchema(deletePrescriptionSchema)
    .use(authMiddleware)
    .action(async ({ parsedInput, ctx }) => {
        try {
            const [deleted] = await db
                .delete(prescriptionTable)
                .where(
                    and(
                        eq(prescriptionTable.id, parsedInput.id),
                        eq(prescriptionTable.userId, ctx.user.id)
                    )
                )
                .returning({ id: prescriptionTable.id });

            if (!deleted) throw new Error("Prescrição não encontrada.");
            return { success: true };
        } catch (error) {
            console.error("Erro ao deletar prescrição:", error);
            throw new Error("Não foi possível deletar a prescrição.");
        }
    });

// ── Get ALL prescriptions for the current user (across all shops) ──

const getAllUserPrescriptionsSchema = z.object({
    limit: z.number().min(1).max(100).default(20),
    offset: z.number().min(0).default(0),
    search: z.string().optional(),
});

export const ActionGetAllUserPrescriptions = createAction
    .inputSchema(getAllUserPrescriptionsSchema)
    .use(authMiddleware)
    .action(async ({ parsedInput, ctx }) => {
        try {
            const conditions = [eq(prescriptionTable.userId, ctx.user.id)];

            if (parsedInput.search && parsedInput.search.trim().length > 0) {
                conditions.push(ilike(patientTable.fullName, `%${parsedInput.search.trim()}%`));
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
                .innerJoin(opticalShopTable, eq(prescriptionTable.opticalShopId, opticalShopTable.id))
                .where(and(...conditions))
                .orderBy(desc(prescriptionTable.createdAt))
                .limit(parsedInput.limit)
                .offset(parsedInput.offset);

            const [{ total }] = await db
                .select({ total: count() })
                .from(prescriptionTable)
                .innerJoin(patientTable, eq(prescriptionTable.patientId, patientTable.id))
                .innerJoin(opticalShopTable, eq(prescriptionTable.opticalShopId, opticalShopTable.id))
                .where(and(...conditions));

            return { data: prescriptions, totalCount: total };
        } catch (error) {
            console.error("Erro ao buscar prescrições:", error);
            throw new Error("Não foi possível buscar as prescrições.");
        }
    });

// ── Autocomplete search patients (for prescription creation) ──

const autocompletePatientSchema = z.object({
    query: z.string().min(1),
});

export const ActionAutocompletePatients = createAction
    .inputSchema(autocompletePatientSchema)
    .use(authMiddleware)
    .action(async ({ parsedInput, ctx }) => {
        try {
            const patients = await db
                .select({
                    id: patientTable.id,
                    fullName: patientTable.fullName,
                    phone: patientTable.phone,
                    cpf: patientTable.cpf,
                })
                .from(patientTable)
                .where(
                    and(
                        eq(patientTable.userId, ctx.user.id),
                        ilike(patientTable.fullName, `%${parsedInput.query}%`)
                    )
                )
                .limit(8);

            return patients;
        } catch (error) {
            console.error("Erro ao buscar pacientes:", error);
            return [];
        }
    });