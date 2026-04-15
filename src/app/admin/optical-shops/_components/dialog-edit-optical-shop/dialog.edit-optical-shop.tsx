"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { iDialogEditOpticalShopProps } from "./dialog.edit-optical-shop.types";
import { FormEditOpticalShop } from "../form-edit-optical-shop/form.edit-optical-shop";

export function DialogEditOpticalShop(props: iDialogEditOpticalShopProps) {
    return (
        <Dialog open={props.isOpen} onOpenChange={props.onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar ótica</DialogTitle>
                    <DialogDescription>
                        Modifique o formulário abaixo para editar a ótica selecionada.
                    </DialogDescription>
                </DialogHeader>
                <FormEditOpticalShop formInitialValue={props.opticalShopData} />
            </DialogContent>
        </Dialog>
    )
}