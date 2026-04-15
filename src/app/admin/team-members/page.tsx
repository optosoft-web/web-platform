import { ActionGetTeamMembers } from "@/server/actions/admin/team-member.actions";
import { ActionGetOpticalShops } from "@/server/actions/admin/optical-shop.actions";
import { ClientContainerTeamMembers } from "./_components/client-container/client-container";

export default async function TeamMembersPage() {
    const { data: membersData } = await ActionGetTeamMembers();
    const { data: opticalShopsData } = await ActionGetOpticalShops();

    return (
        <ClientContainerTeamMembers
            initialMembers={membersData ?? []}
            opticalShops={opticalShopsData ?? []}
        />
    );
}
