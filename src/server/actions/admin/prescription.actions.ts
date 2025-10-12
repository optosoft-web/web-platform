"use server";

import { z } from "zod";
import { and, eq } from "drizzle-orm";
import db from "@/server/database/index";
import { patientTable, prescriptionTable } from "@/server/database/tables";
import { authMiddleware, createAction } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";

const createPrescriptionSchema = z.object({
    patientId: z.string(),
    rightEyeSpherical: z.number().optional(),
    rightEyeCylindrical: z.number().optional(),
    rightEyeAxis: z.number().int().optional(),
    leftEyeSpherical: z.number().optional(),
    leftEyeCylindrical: z.number().optional(),
    leftEyeAxis: z.number().int().optional(),
    addition: z.number().optional(),
    notes: z.string().optional(),
    prescriptionDate: z.string(),
});


export const createPrescription = createAction.inputSchema(createPrescriptionSchema).use(authMiddleware).action(
    async ({ parsedInput, ctx }) => {
        const { user } = ctx;

        const patient = await db.query.patientTable.findFirst({
            where: and(
                eq(patientTable.id, parsedInput.patientId),
                eq(patientTable.userId, user.id)
            )
        });

        if (!patient) {
            throw new Error("Paciente não encontrado ou acesso negado.");
        }

        try {
            const [newPrescription] = await db.insert(prescriptionTable).values({
                ...parsedInput,
                userId: user.id,
                rightEyeSpherical: parsedInput.rightEyeSpherical?.toString(),
                rightEyeCylindrical: parsedInput.rightEyeCylindrical?.toString(),
                leftEyeSpherical: parsedInput.leftEyeSpherical?.toString(),
                leftEyeCylindrical: parsedInput.leftEyeCylindrical?.toString(),
                addition: parsedInput.addition?.toString(),
            }).returning();

            revalidatePath('/admin/patients', 'page')
            return newPrescription;

        } catch (error) {
            console.error("Erro ao criar prescrição:", error);
            throw new Error("Não foi possível salvar a prescrição.");
        }
    }
);


const getPrescriptionsSchema = z.object({
    patientId: z.string(),
});

export const getPrescriptionsForPatient = createAction.inputSchema(getPrescriptionsSchema).use(authMiddleware).action(
    async ({ parsedInput, ctx }) => {
        const patient = await db.query.patientTable.findFirst({
            where: and(
                eq(patientTable.id, parsedInput.patientId),
                eq(patientTable.userId, ctx.user.id)
            )
        });

        if (!patient) {
            throw new Error("Paciente não encontrado ou acesso negado.");
        }

        try {
            const prescriptions = await db.query.prescriptionTable.findMany({
                where: eq(prescriptionTable.patientId, parsedInput.patientId),
                orderBy: (prescriptions, { desc }) => [desc(prescriptions.prescriptionDate)],
            });
            return prescriptions;
        } catch (error) {
            console.error("Erro ao buscar prescrições:", error);
            throw new Error("Não foi possível buscar as prescrições.");
        }
    }
);


const deletePrescriptionSchema = z.object({
    id: z.string(),
});

export const deletePrescription = createAction.inputSchema(deletePrescriptionSchema).use(authMiddleware).action(
    async ({ parsedInput, ctx }) => {
        try {
            const [deletedPrescription] = await db.delete(prescriptionTable)
                .where(
                    and(
                        eq(prescriptionTable.id, parsedInput.id),
                        eq(prescriptionTable.userId, ctx.user.id)
                    )
                )
                .returning({ id: prescriptionTable.id });

            if (!deletedPrescription) {
                throw new Error("Prescrição não encontrada ou acesso negado.");
            }

            return { success: true, message: "Prescrição deletada com sucesso." };
        } catch (error) {
            console.error("Erro ao deletar prescrição:", error);
            throw new Error("Não foi possível deletar a prescrição.");
        }
    }
)