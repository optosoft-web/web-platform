import { ActionGetOpticalShopsForCards } from "@/server/actions/admin/optical-shop.actions";
import { ClientContainerOpticalShops } from "./_components/client-container/client-container";

export default async function OpticalShopsPage() {
    const { data: opticalShopsData } = await ActionGetOpticalShopsForCards();

    return (
        <ClientContainerOpticalShops initialOpticalShops={opticalShopsData ?? []} />
    )
}