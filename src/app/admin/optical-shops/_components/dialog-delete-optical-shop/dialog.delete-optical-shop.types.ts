export interface iOpticalShopDelete {
    id: string;
    name: string;
    totalPatient: number;
}

export interface iDialogDeleteOpticalShopProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    opticalShopData: iOpticalShopDelete;
}