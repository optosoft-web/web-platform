'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/utils/supabase/server'
import { ActionError, createAction } from '@/lib/safe-action';
import z from 'zod';
import { flattenValidationErrors } from 'next-safe-action';

const schemaSignUpInput = z.object({
    fullName: z.string().min(5),
    email: z.email().min(1, "O e-mail é obrigatório."),
    password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres."),
    confirmedPassWord: z.string().min(8, "A senha deve ter no mínimo 8 caracteres.")
}).refine((data) => data.password === data.confirmedPassWord, {
    message: "As senhas não são iguais.",
    path: ["confirmedPassWord"],
});

export const ActionSignUpUser = createAction
    .inputSchema(schemaSignUpInput, {
        handleValidationErrorsShape: async (ve) => flattenValidationErrors(ve).fieldErrors,
    })
    .action(
        async ({ parsedInput: { fullName, email, password } }) => {
            const supabase = await createClient()

            const { data, error: errorSignUp } = await supabase.auth.signUp({
                email,
                password
            })

            if (errorSignUp) {
                if (errorSignUp.code === 'email_exists') {
                    throw new ActionError('O e-mail informado já existe.');
                }
                if (errorSignUp.code === 'email_address_invalid') {
                    throw new ActionError('O e-mail informado é inválido.');
                }
                throw new Error();
            }

            const { } = await supabase.from('customers').insert([
                {
                    id: data.user?.id,
                    full_name: fullName
                }
            ]).select();

            revalidatePath('/', 'layout')
            // redirect('/auth/sign-in')
        },
        {
            onError: async (args) => {
                console.log("Logging from onError callback:");
                console.dir(args, { depth: null });
            },
        }
    );