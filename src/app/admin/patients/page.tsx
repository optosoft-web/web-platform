import { ActionGetOpticalShopsForCards } from "@/server/actions/admin/optical-shop.actions";
import { ClientContainerPatients } from "./_components/client-container/client-container";

export default async function PatientsPage() {
    const { data: shopsData } = await ActionGetOpticalShopsForCards();

    const shops = (shopsData ?? []).map((s) => ({
        id: s.id,
        name: s.name,
    }));

    return <ClientContainerPatients shops={shops} />;
}
