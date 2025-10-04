'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'
import { ActionError, createAction } from '@/lib/safe-action';
import z from 'zod';
import { flattenValidationErrors, returnValidationErrors } from 'next-safe-action';

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
                if (error.code === 'invalid_credentials') {
                    throw new ActionError('Credenciais inválidas.');
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

export async function signup(formData: FormData) {
    const supabase = await createClient()

    // type-casting here for convenience
    // in practice, you should validate your inputs
    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { error } = await supabase.auth.signUp(data)

    if (error) {
        redirect('/error')
    }

    revalidatePath('/', 'layout')
    redirect('/')
}