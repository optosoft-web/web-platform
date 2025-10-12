'use server'

import { createClient } from '@/utils/supabase/server'
import { ActionError, createAction } from '@/lib/safe-action';
import database from '@/server/database';
import { eq, sql } from 'drizzle-orm';
import { patientTable, prescriptionTable } from '@/server/database/tables';

export const ActionGetPatientDataTable = createAction
    .action(
        async () => {
            try {
                const supabase = await createClient()

                const { data: { user }, error: errorAuthUser } = await supabase.auth.getUser();
                if (errorAuthUser || !user) {
                    throw new ActionError('Houve um problema na autenticação do usuário.')
                }

                const query = await database.query.patientTable.findMany({
                    where: eq(patientTable.userId, user.id),
                    columns: {
                        id: true,
                        fullName: true,
                        dateOfBirth: true,
                        contactInfo: true,
                        createdAt: true,
                    },
                    extras: {
                        // AQUI ESTÁ A CORREÇÃO:
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