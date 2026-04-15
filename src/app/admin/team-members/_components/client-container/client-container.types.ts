export interface TeamMemberItem {
    id: string;
    fullName: string;
    email: string;
    active: boolean;
    createdAt: Date;
    opticalShops: { id: string; name: string }[];
}

export interface OpticalShopOption {
    id: string;
    name: string;
}

export interface ClientContainerTeamMembersProps {
    initialMembers: TeamMemberItem[];
    opticalShops: OpticalShopOption[];
}
