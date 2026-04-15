"use server";

import db from "@/server/database/index";
import { authMiddleware, createAction } from "@/lib/safe-action";
import { eq } from "drizzle-orm";
import { subscriptionTable } from "@/server/database/tables";


export const getUserSubscription = createAction.use(authMiddleware).action(
    async ({ ctx }) => {
        const user = ctx.user;

        try {
            return await db.query.subscriptionTable.findFirst({
                where: eq(subscriptionTable.userId, user.id)
            })

        } catch (error) {
            console.error("Erro ao buscar subscription:", error);
            throw error;
        }
    })
