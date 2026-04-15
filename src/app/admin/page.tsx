import { ActionGetDashboardData } from "@/server/actions/admin/dashboard.actions";
import { ActionGetOpticalShopsForCards } from "@/server/actions/admin/optical-shop.actions";
import { DashboardClient } from "./_components/dashboard-client";

export default async function AdminHomePage() {
    const [result, shopsResult] = await Promise.all([
        ActionGetDashboardData(),
        ActionGetOpticalShopsForCards(),
    ]);

    const shops = (shopsResult?.data ?? []).map((s) => ({
        id: s.id,
        name: s.name,
    }));

    return <DashboardClient data={result?.data ?? null} shops={shops} />;
}
