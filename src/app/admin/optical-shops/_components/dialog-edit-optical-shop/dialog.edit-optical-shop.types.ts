export interface iOpticalShop {
    id: string;
    name: string;
    address: string | undefined;
}

export interface iDialogEditOpticalShopProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    opticalShopData: iOpticalShop;
}