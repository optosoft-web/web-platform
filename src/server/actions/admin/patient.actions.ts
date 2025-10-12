"use server";

import { z } from "zod";
import { and, eq, ilike, sql } from "drizzle-orm";
import db from "@/server/database/index";
import { patientTable, prescriptionTable, opticalShopTable, patientOpticalShops } from "@/server/database/tables";
import { ActionError, authMiddleware, createAction } from "@/lib/safe-action";
import { createClient } from "@/utils/supabase/server";

const createPatientSchema = z.object({
    fullName: z.string().min(3, "O nome completo é obrigatório."),
    dateOfBirth: z.string().optional(),
    contactInfo: z.string().optional(),
    opticalShopId: z.string(),
});

export const createPatient = createAction.inputSchema(createPatientSchema).use(authMiddleware).action(
    async ({ parsedInput: { fullName, dateOfBirth, contactInfo, opticalShopId }, ctx }) => {
        const { user } = ctx;

        try {
            const newPatient = await db.transaction(async (tx) => {
                const [createdPatient] = await tx
                    .insert(patientTable)
                    .values({
                        userId: user.id,
                        fullName,
                        dateOfBirth,
                        contactInfo,
                    })
                    .returning();

                if (!createdPatient) {
                    tx.rollback();
                    throw new Error("Não foi possível criar o paciente.");
                }

                await tx.insert(patientOpticalShops).values({
                    patientId: createdPatient.id,
                    opticalShopId: opticalShopId,
                });

                return createdPatient;
            });

            return newPatient;
        } catch (error) {
            console.error("Erro na transação de criar paciente:", error);
            throw new Error("Ocorreu um erro ao salvar o novo paciente e sua associação.");
        }
    }
);

export const getPatients = createAction.use(authMiddleware).action(
    async ({ ctx }) => {
        try {
            const patients = await db.query.patientTable.findMany({
                where: eq(patientTable.userId, ctx.user.id),
                orderBy: (patients, { desc }) => [desc(patients.createdAt)],
            });
            return patients;
        } catch (error) {
            console.error("Erro ao buscar pacientes:", error);
            throw new Error("Não foi possível buscar os pacientes.");
        }
    }
)

const searchPatientsSchema = z.object({
    query: z.string(),
});

export const searchPatients = createAction
    .inputSchema(searchPatientsSchema)
    .use(authMiddleware)
    .action(async ({ parsedInput, ctx }) => {
        try {
            if (parsedInput.query.length === 0) {
                return [];
            }

            const patients = await db.query.patientTable.findMany({
                where: and(
                    eq(patientTable.userId, ctx.user.id),
                    ilike(patientTable.fullName, `%${parsedInput.query}%`)
                ),
                limit: 5,
            });
            return patients;
        } catch (error) {
            console.error("Erro ao buscar pacientes:", error);
            return [];
        }
    });

const getPatientDetailsSchema = z.object({
    id: z.string(),
});



export const getPatientDetails = createAction.inputSchema(getPatientDetailsSchema).use(authMiddleware).action(
    async ({ parsedInput, ctx }) => {
        try {
            const patientDetails = await db.query.patientTable.findFirst({
                where: and(
                    eq(patientTable.id, parsedInput.id),
                    eq(patientTable.userId, ctx.user.id)
                ),
                with: {
                    prescriptions: {
                        // @ts-ignore
                        orderBy: (prescriptions, { desc }) => [desc(prescriptions.prescriptionDate)]
                    },
                    patientOpticalShops: {
                        with: {
                            opticalShop: true
                        }
                    }
                }
            });

            if (!patientDetails) {
                throw new Error("Paciente não encontrado ou acesso negado.");
            }

            return patientDetails;
        } catch (error) {
            console.error("Erro ao buscar detalhes do paciente:", error);
            throw new Error("Não foi possível buscar os detalhes do paciente.");
        }
    }
);

export const ActionGetPatientDataTable = createAction
    .action(
        async () => {
            try {
                const supabase = await createClient()

                const { data: { user }, error: errorAuthUser } = await supabase.auth.getUser();
                if (errorAuthUser || !user) {
                    throw new ActionError('Houve um problema na autenticação do usuário.')
                }

                const query = await db.query.patientTable.findMany({
                    where: eq(patientTable.userId, user.id),
                    columns: {
                        id: true,
                        fullName: true,
                        dateOfBirth: true,
                        contactInfo: true,
                        createdAt: true,
                    },
                    extras: {
                        lastPrescriptionDate: sql<string | null>`(
                            SELECT MAX(${prescriptionTable.prescriptionDate}) 
                            FROM ${prescriptionTable} 
                            WHERE ${prescriptionTable.patientId} = ${patientTable.id}
                        )`.as('last_prescription_date'),
                    }
                });

                return query;
            } catch (error) {
                console.log(error)
            }
        },
        {
            onError: async (args) => {
                console.log("Logging from onError callback:");
                console.dir(args, { depth: null });
            },
        }
    );

const linkPatientToShopSchema = z.object({
    patientId: z.string(),
    opticalShopId: z.string(),
});

export const linkPatientToShop = createAction.inputSchema(linkPatientToShopSchema).use(authMiddleware).action(
    async ({ parsedInput, ctx }) => {
        const { user } = ctx;

        const patient = await db.query.patientTable.findFirst({
            where: and(eq(patientTable.id, parsedInput.patientId), eq(patientTable.userId, user.id))
        });
        const shop = await db.query.opticalShopTable.findFirst({
            where: and(eq(opticalShopTable.id, parsedInput.opticalShopId), eq(opticalShopTable.userId, user.id))
        });

        if (!patient || !shop) {
            throw new Error("Paciente ou Ótica não encontrado(a) ou acesso negado.");
        }

        try {
            const [link] = await db.insert(patientOpticalShops).values({
                patientId: parsedInput.patientId,
                opticalShopId: parsedInput.opticalShopId,
            }).returning();

            return link;
        } catch (error) {
            console.error("Erro ao associar paciente à ótica:", error);
            throw new Error("Não foi possível realizar a associação.");
        }
    }
);


const unlinkPatientFromShopSchema = z.object({
    patientId: z.string().uuid(),
    opticalShopId: z.string().uuid(),
});

export const unlinkPatientFromShop = createAction.inputSchema(unlinkPatientFromShopSchema).use(authMiddleware).action(
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
            await db.delete(patientOpticalShops).where(
                and(
                    eq(patientOpticalShops.patientId, parsedInput.patientId),
                    eq(patientOpticalShops.opticalShopId, parsedInput.opticalShopId)
                )
            );

            return { success: true, message: "Associação removida." };
        } catch (error) {
            console.error("Erro ao remover associação:", error);
            throw new Error("Não foi possível remover a associação.");
        }
    }
);


const updatePatientSchema = z.object({
    id: z.string(),
    fullName: z.string().min(3, "O nome completo é obrigatório.").optional(),
    dateOfBirth: z.string().optional(),
    contactInfo: z.string().optional(),
});

export const updatePatient = createAction.inputSchema(updatePatientSchema).use(authMiddleware).action(
    async ({ parsedInput, ctx }) => {
        try {
            const [updatedPatient] = await db.update(patientTable)
                .set({
                    fullName: parsedInput.fullName,
                    dateOfBirth: parsedInput.dateOfBirth,
                    contactInfo: parsedInput.contactInfo,
                    updatedAt: new Date(),
                })
                .where(
                    and(
                        eq(patientTable.id, parsedInput.id),
                        eq(patientTable.userId, ctx.user.id)
                    )
                )
                .returning();

            if (!updatedPatient) {
                throw new Error("Paciente não encontrado ou acesso negado.");
            }

            return updatedPatient;
        } catch (error) {
            console.error("Erro ao atualizar paciente:", error);
            throw error;
        }
    }
)

const deletePatientSchema = z.object({
    id: z.string(),
});

export const deletePatient = createAction.inputSchema(deletePatientSchema).use(authMiddleware).action(
    async ({ parsedInput, ctx }) => {
        try {
            const patient = await db.query.patientTable.findFirst({
                where: and(
                    eq(patientTable.id, parsedInput.id),
                    eq(patientTable.userId, ctx.user.id)
                ),
            });

            if (!patient) {
                throw new Error("Paciente não encontrado ou acesso negado.");
            }

            await db.delete(prescriptionTable).where(eq(prescriptionTable.patientId, parsedInput.id));

            await db.delete(patientTable).where(eq(patientTable.id, parsedInput.id));

            return { success: true, message: "Paciente e suas prescrições foram deletados." };
        } catch (error) {
            console.error("Erro ao deletar paciente:", error);
            throw error;
        }
    }
);