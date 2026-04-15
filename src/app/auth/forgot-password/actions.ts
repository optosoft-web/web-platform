'use server'

import { createClient } from '@/utils/supabase/server'
import { ActionError, createAction } from '@/lib/safe-action';
import z from 'zod';
import { flattenValidationErrors } from 'next-safe-action';
import { env } from 'process';

const schemaForgotPasswordInput = z.object({
    email: z.email().min(1, "O e-mail é obrigatório."),
})

export const ActionForgotPassword = createAction
    .inputSchema(schemaForgotPasswordInput, {
        handleValidationErrorsShape: async (ve) => flattenValidationErrors(ve).fieldErrors,
    })
    .action(
        async ({ parsedInput: { email } }) => {
            const supabase = await createClient()

            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: env.VERCEL_URL + '/auth/reset-password'
            })

            if (error) {
                if (error.code === 'email_exists') {
                    throw new ActionError('O e-mail informado já existe.');
                }
                if (error.code === 'email_address_invalid') {
                    throw new ActionError('O e-mail informado é inválido.');
                }
                throw new Error();
            }
        },
        {
            onError: async (args) => {
                console.log("Logging from onError callback:");
                console.dir(args, { depth: null });
            },
        }
    );