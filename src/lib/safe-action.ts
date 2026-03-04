import { createClient } from '@/utils/supabase/server'
import { createMiddleware, createSafeActionClient, DEFAULT_SERVER_ERROR_MESSAGE } from "next-safe-action";

export class ActionError extends Error { }

export const authMiddleware = createMiddleware().define(async ({ next }) => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Sessão não encontrada. Por favor, faça login.");
    }

    // const { data: profile } = await supabase.from('customers').select('full_name').eq('id', user.id).single();

    return next({ ctx: { user } });
});

export const createAction = createSafeActionClient({

    handleServerError: (error) => {
        console.error("🔴 Server action error:", error);
        if (error instanceof ActionError) {
            return error.message;
        }
        return DEFAULT_SERVER_ERROR_MESSAGE;
    },
});
