import { ActionGetDashboardData } from "@/server/actions/admin/dashboard.actions";
import { DashboardClient } from "./_components/dashboard-client";

export default async function AdminHomePage() {
    const result = await ActionGetDashboardData();

    return <DashboardClient data={result?.data ?? null} />;
}
