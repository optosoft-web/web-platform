'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'
import { ActionError, createAction } from '@/lib/safe-action';
import z from 'zod';
import { flattenValidationErrors } from 'next-safe-action';

const schemaResetPasswordInput = z.object({
    password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres."),
    confirmedPassWord: z.string().min(8, "A senha deve ter no mínimo 8 caracteres."),
    code: z.string().min(1, "O código de verificação é obrigatório.")
}).refine((data) => data.password === data.confirmedPassWord, {
    message: "As senhas não são iguais.",
    path: ["confirmedPassWord"],
});

export const ActionResetPassword = createAction
    .inputSchema(schemaResetPasswordInput, {
        handleValidationErrorsShape: async (ve) => flattenValidationErrors(ve).fieldErrors,
    })
    .action(
        async ({ parsedInput: { password, code } }) => {
            const supabase = await createClient()

            const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

            if (exchangeError) {
                throw new ActionError("O link de redefinição de senha é inválido ou expirou.");
            }

            const { error } = await supabase.auth.updateUser({ password });
            console.log({ error })

            if (error) {
                if (error.code === 'email_exists') {
                    throw new ActionError('O e-mail informado já existe.');
                }
                if (error.code === 'email_address_invalid') {
                    throw new ActionError('O e-mail informado é inválido.');
                }
                throw new Error();
            }

            revalidatePath('/', 'layout');
            redirect('/admin/optical-shops')
        },
        {
            onError: async (args) => {
                console.log("Logging from onError callback:");
                console.dir(args, { depth: null });
            },
        }
    );