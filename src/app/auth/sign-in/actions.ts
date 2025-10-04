'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'
import { ActionError, createAction } from '@/lib/safe-action';
import z from 'zod';
import { flattenValidationErrors } from 'next-safe-action';

const schemaSignInInput = z.object({
    email: z.email(),
    password: z.string()
})

export const ActionSignInUser = createAction
    .inputSchema(schemaSignInInput, {
        handleValidationErrorsShape: async (ve) => flattenValidationErrors(ve).fieldErrors,
    })
    .action(
        async ({ parsedInput: { email, password } }) => {
            const supabase = await createClient()

            const { error } = await supabase.auth.signInWithPassword({ email, password })
            if (error) {
                console.log({ error })
                if (error.code === 'invalid_credentials') {
                    throw new ActionError('Credenciais inválidas.');
                }
                if (error.code === 'email_not_confirmed') {
                    throw new ActionError('Por favor, confirme sua conta através do e-mail que enviamos.');
                }
                throw new Error();
            }

            revalidatePath('/', 'layout')
            redirect('/')
        },
        {
            onError: async (args) => {
                console.log("Logging from onError callback:");
                console.dir(args, { depth: null });
            },
        }
    );