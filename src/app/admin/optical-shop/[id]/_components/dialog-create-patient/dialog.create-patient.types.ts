export interface iDialogCreatePatientProps {
    children?: React.ReactNode;
    opticalShopId: string;
    /** Controlled mode */
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    /** Called after patient is successfully created */
    onSuccess?: () => void;
}