import { ActionGetOpticalShopsForCards } from "@/server/actions/admin/optical-shop.actions";
import { ClientContainerOpticalShops } from "./_components/client-container/client-container";
import { QueryProvider } from "@/components/shared/query-provider/query-provider";

export default async function OpticalShopsPage() {
    const { data: opticalShopsData } = await ActionGetOpticalShopsForCards();

    return (
        <QueryProvider>
            <ClientContainerOpticalShops initialOpticalShops={opticalShopsData ?? []} />
        </QueryProvider>
    )
}