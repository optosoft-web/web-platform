"use server";

import { eq } from "drizzle-orm";
import db from "@/server/database/index";
import { teamMemberTable, teamMemberOpticalShopTable, opticalShopTable, profileTable } from "@/server/database/tables";
import { authMiddleware, createAction } from "@/lib/safe-action";
import { supabaseAdmin } from "@/utils/supabase/admin";

/**
 * Returns team membership info for the currently logged-in user,
 * or null if they are NOT a team member (i.e. they are an owner).
 */
export const getTeamMembershipForCurrentUser = createAction
    .use(authMiddleware)
    .action(async ({ ctx }) => {
        try {
            const membership = await db
                .select({
                    id: teamMemberTable.id,
                    ownerId: teamMemberTable.ownerId,
                    fullName: teamMemberTable.fullName,
                    email: teamMemberTable.email,
                    active: teamMemberTable.active,
                })
                .from(teamMemberTable)
                .where(eq(teamMemberTable.memberUserId, ctx.user.id))
                .limit(1);

            if (membership.length === 0) return null;

            const member = membership[0];

            // Fetch owner name from profiles, fall back to auth email
            const ownerProfile = await db
                .select({ fullName: profileTable.fullName })
                .from(profileTable)
                .where(eq(profileTable.id, member.ownerId))
                .limit(1);

            let ownerName = ownerProfile[0]?.fullName?.trim() || null;

            if (!ownerName) {
                const { data: ownerAuth } = await supabaseAdmin.auth.admin.getUserById(member.ownerId);
                ownerName = ownerAuth?.user?.email ?? "Proprietário";
            }

            // Fetch assigned optical shops
            const shops = await db
                .select({
                    id: opticalShopTable.id,
                    name: opticalShopTable.name,
                })
                .from(teamMemberOpticalShopTable)
                .innerJoin(
                    opticalShopTable,
                    eq(teamMemberOpticalShopTable.opticalShopId, opticalShopTable.id),
                )
                .where(eq(teamMemberOpticalShopTable.teamMemberId, member.id));

            return {
                ...member,
                ownerName: ownerName,
                opticalShops: shops,
            };
        } catch (error) {
            console.error("Erro ao verificar membership:", error);
            return null;
        }
    });
