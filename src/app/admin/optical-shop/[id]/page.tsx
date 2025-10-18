import { ActionGetOpticalShopById } from "@/server/actions/admin/optical-shop.actions";
import { ClientContainerOpticalShop } from "./_components/client-container/client-container";

interface iOpticalShopPageParams {
    id: string;
}
interface iOpticalShopPageProps {
    params: Promise<iOpticalShopPageParams>;
}
export default async function OpticalShopPage(props: iOpticalShopPageProps) {
    const { id } = await props.params;
    const request = await ActionGetOpticalShopById({ id });

    if (!request.data) {
        throw new Error('Não foi possível encontrar a ótica informada.')
    }
    if (request.serverError || request.validationErrors) {
        throw new Error('Houve um erro interno.')
    }

    return (
        <ClientContainerOpticalShop opticalShopData={request.data} />
    )
}