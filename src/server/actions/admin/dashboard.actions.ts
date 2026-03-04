"use server";

import { and, count, desc, eq, gte, sql } from "drizzle-orm";
import db from "@/server/database/index";
import {
    opticalShopTable,
    patientTable,
    prescriptionTable,
    teamMemberTable,
} from "@/server/database/tables";
import { authMiddleware, createAction } from "@/lib/safe-action";

export const ActionGetDashboardData = createAction
    .use(authMiddleware)
    .action(async ({ ctx }) => {
        const userId = ctx.user.id;

        // Date ranges
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        // ── Total counts ──
        const [opticalShopsCount] = await db
            .select({ value: count() })
            .from(opticalShopTable)
            .where(eq(opticalShopTable.userId, userId));

        const [patientsCount] = await db
            .select({ value: count() })
            .from(patientTable)
            .where(eq(patientTable.userId, userId));

        const [prescriptionsCount] = await db
            .select({ value: count() })
            .from(prescriptionTable)
            .where(eq(prescriptionTable.userId, userId));

        const [teamMembersCount] = await db
            .select({ value: count() })
            .from(teamMemberTable)
            .where(eq(teamMemberTable.ownerId, userId));

        // ── This month counts ──
        const [patientsThisMonth] = await db
            .select({ value: count() })
            .from(patientTable)
            .where(
                and(
                    eq(patientTable.userId, userId),
                    gte(patientTable.createdAt, startOfMonth)
                )
            );

        const [prescriptionsThisMonth] = await db
            .select({ value: count() })
            .from(prescriptionTable)
            .where(
                and(
                    eq(prescriptionTable.userId, userId),
                    gte(prescriptionTable.createdAt, startOfMonth)
                )
            );

        // ── Last month counts (for comparison) ──
        const [patientsLastMonth] = await db
            .select({ value: count() })
            .from(patientTable)
            .where(
                and(
                    eq(patientTable.userId, userId),
                    gte(patientTable.createdAt, startOfLastMonth),
                    sql`${patientTable.createdAt} <= ${endOfLastMonth}`
                )
            );

        const [prescriptionsLastMonth] = await db
            .select({ value: count() })
            .from(prescriptionTable)
            .where(
                and(
                    eq(prescriptionTable.userId, userId),
                    gte(prescriptionTable.createdAt, startOfLastMonth),
                    sql`${prescriptionTable.createdAt} <= ${endOfLastMonth}`
                )
            );

        // ── Recent prescriptions (last 5) ──
        const recentPrescriptions = await db
            .select({
                id: prescriptionTable.id,
                patientName: patientTable.fullName,
                opticalShopName: opticalShopTable.name,
                prescriptionDate: prescriptionTable.prescriptionDate,
                rightEyeSpherical: prescriptionTable.rightEyeSpherical,
                leftEyeSpherical: prescriptionTable.leftEyeSpherical,
                createdAt: prescriptionTable.createdAt,
            })
            .from(prescriptionTable)
            .innerJoin(patientTable, eq(prescriptionTable.patientId, patientTable.id))
            .innerJoin(opticalShopTable, eq(prescriptionTable.opticalShopId, opticalShopTable.id))
            .where(eq(prescriptionTable.userId, userId))
            .orderBy(desc(prescriptionTable.createdAt))
            .limit(5);

        // ── Recent patients (last 5) ──
        const recentPatients = await db
            .select({
                id: patientTable.id,
                fullName: patientTable.fullName,
                phone: patientTable.phone,
                createdAt: patientTable.createdAt,
            })
            .from(patientTable)
            .where(eq(patientTable.userId, userId))
            .orderBy(desc(patientTable.createdAt))
            .limit(5);

        // ── Prescriptions per month (last 6 months) ──
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        const prescriptionsPerMonth = await db
            .select({
                month: sql<string>`to_char(${prescriptionTable.createdAt}, 'YYYY-MM')`,
                value: count(),
            })
            .from(prescriptionTable)
            .where(
                and(
                    eq(prescriptionTable.userId, userId),
                    gte(prescriptionTable.createdAt, sixMonthsAgo)
                )
            )
            .groupBy(sql`to_char(${prescriptionTable.createdAt}, 'YYYY-MM')`)
            .orderBy(sql`to_char(${prescriptionTable.createdAt}, 'YYYY-MM')`);

        return {
            totals: {
                opticalShops: opticalShopsCount.value,
                patients: patientsCount.value,
                prescriptions: prescriptionsCount.value,
                teamMembers: teamMembersCount.value,
            },
            thisMonth: {
                patients: patientsThisMonth.value,
                prescriptions: prescriptionsThisMonth.value,
            },
            lastMonth: {
                patients: patientsLastMonth.value,
                prescriptions: prescriptionsLastMonth.value,
            },
            recentPrescriptions,
            recentPatients,
            prescriptionsPerMonth,
        };
    });
