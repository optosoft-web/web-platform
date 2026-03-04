import { ActionGetOpticalShopsForCards } from "@/server/actions/admin/optical-shop.actions";
import { ClientContainerPrescriptions } from "./_components/client-container/client-container";

export default async function PrescriptionsPage() {
    const { data: shopsData } = await ActionGetOpticalShopsForCards();

    const shops = (shopsData ?? []).map((s) => ({
        id: s.id,
        name: s.name,
    }));

    return <ClientContainerPrescriptions shops={shops} />;
}
