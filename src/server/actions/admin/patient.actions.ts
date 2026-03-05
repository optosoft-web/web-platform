"use server";

import { z } from "zod";
import { and, count, desc, eq, ilike, or, sql } from "drizzle-orm";
import db from "@/server/database/index";
import { patientTable, prescriptionTable, opticalShopTable, patientOpticalShops } from "@/server/database/tables";
import { ActionError, authMiddleware, createAction } from "@/lib/safe-action";
import { createClient } from "@/utils/supabase/server";

const createPatientSchema = z.object({
    fullName: z.string().min(3, "O nome completo é obrigatório."),
    dateOfBirth: z.string().optional(),
    contactInfo: z.string().optional(),
    phone: z.string().optional(),
    cpf: z.string().optional(),
    rg: z.string().optional(),
    opticalShopId: z.string(),
});

export const createPatient = createAction.inputSchema(createPatientSchema).use(authMiddleware).action(
    async ({ parsedInput: { fullName, dateOfBirth, contactInfo, phone, cpf, rg, opticalShopId }, ctx }) => {
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
                        phone: phone || null,
                        cpf: cpf || null,
                        rg: rg || null,
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

// 1. Schema de entrada mais robusto
const searchPatientsSchema = z.object({
    query: z.string().optional(),
    limit: z.number().min(1).max(100).default(10),
    offset: z.number().min(0).default(0),
    sortColumn: z.string().optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const ActionSearchPatients = createAction
    .inputSchema(searchPatientsSchema)
    .use(authMiddleware)
    .action(async ({ parsedInput, ctx }) => {
        try {
            const { limit, offset, query, sortColumn, sortOrder } = parsedInput;

            // 2. Construção dinâmica da cláusula 'where'
            const whereConditions = and(
                eq(patientTable.userId, ctx.user.id),
                query // Se 'query' existir, busca em múltiplos campos
                    ? or(
                        ilike(patientTable.fullName, `%${query}%`),
                        ilike(patientTable.contactInfo, `%${query}%`)
                    )
                    : undefined
            );

            // 3. Busca dos pacientes com paginação e ordenação
            const patientsQuery = db.query.patientTable.findMany({
                where: whereConditions,
                limit,
                offset,
                orderBy: (table, { asc, desc }) => {
                    if (!sortColumn) return desc(table.createdAt); // Ordem padrão

                    const orderFunction = sortOrder === 'asc' ? asc : desc;

                    // Mapeia a string do frontend para a coluna do Drizzle
                    switch (sortColumn) {
                        case 'fullName':
                            return orderFunction(table.fullName);
                        case 'dateOfBirth':
                            return orderFunction(table.dateOfBirth);
                        case 'createdAt':
                            return orderFunction(table.createdAt);
                        default:
                            return desc(table.createdAt);
                    }
                },
            });

            // 4. Busca do total de registros para a paginação
            const totalCountQuery = db
                .select({ count: count() })
                .from(patientTable)
                .where(whereConditions);

            // Executa as duas queries em paralelo para mais eficiência
            const [patients, totalCountResult] = await Promise.all([
                patientsQuery,
                totalCountQuery,
            ]);

            const total = totalCountResult[0]?.count ?? 0;

            // 5. Retorna os dados e o total
            return {
                data: patients,
                totalCount: total,
            };

        } catch (error) {
            console.error("Erro ao buscar pacientes:", error);
            throw new Error("Não foi possível buscar os pacientes.");
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

// ── Get all patients with optical shops and prescription count ──

const getAllPatientsSchema = z.object({
    limit: z.number().min(1).max(100).default(20),
    offset: z.number().min(0).default(0),
    search: z.string().optional(),
    opticalShopId: z.string().uuid().optional(),
});

export const ActionGetAllPatients = createAction
    .inputSchema(getAllPatientsSchema)
    .use(authMiddleware)
    .action(async ({ parsedInput, ctx }) => {
        try {
            const conditions = [eq(patientTable.userId, ctx.user.id)];

            if (parsedInput.search && parsedInput.search.trim().length > 0) {
                const q = `%${parsedInput.search.trim()}%`;
                conditions.push(
                    or(
                        ilike(patientTable.fullName, q),
                        ilike(patientTable.phone, q),
                        ilike(patientTable.cpf, q),
                    )!
                );
            }

            if (parsedInput.opticalShopId) {
                conditions.push(
                    sql`${patientTable.id} IN (
                        SELECT ${patientOpticalShops.patientId}
                        FROM ${patientOpticalShops}
                        WHERE ${patientOpticalShops.opticalShopId} = ${parsedInput.opticalShopId}
                    )`
                );
            }

            const patients = await db
                .select({
                    id: patientTable.id,
                    fullName: patientTable.fullName,
                    phone: patientTable.phone,
                    cpf: patientTable.cpf,
                    dateOfBirth: patientTable.dateOfBirth,
                    createdAt: patientTable.createdAt,
                    prescriptionCount: sql<number>`(
                        SELECT COUNT(*) FROM ${prescriptionTable}
                        WHERE ${prescriptionTable.patientId} = ${patientTable.id}
                    )`.mapWith(Number),
                    lastPrescriptionDate: sql<string | null>`(
                        SELECT MAX(${prescriptionTable.prescriptionDate})
                        FROM ${prescriptionTable}
                        WHERE ${prescriptionTable.patientId} = ${patientTable.id}
                    )`,
                })
                .from(patientTable)
                .where(and(...conditions))
                .orderBy(desc(patientTable.createdAt))
                .limit(parsedInput.limit)
                .offset(parsedInput.offset);

            const [{ total }] = await db
                .select({ total: count() })
                .from(patientTable)
                .where(and(...conditions));

            // Fetch optical shops for these patients
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
                        sql`${patientOpticalShops.patientId} IN (${sql.join(
                            patientIds.map((id) => sql`${id}`),
                            sql`, `
                        )})`
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

            return { data, totalCount: total };
        } catch (error) {
            console.error("Erro ao buscar todos os pacientes:", error);
            throw new Error("Não foi possível buscar os pacientes.");
        }
    });