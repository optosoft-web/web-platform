"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { iDialogDeleteOpticalShopProps } from "./dialog.delete-optical-shop.types";
import { FormDeleteOpticalShop } from "../form-delete-optical-shop/form.delete-optical-shop";

export function DialogDeleteOpticalShop(props: iDialogDeleteOpticalShopProps) {
    return (
        <Dialog open={props.isOpen} onOpenChange={props.onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Deletar ótica</DialogTitle>
                    <DialogDescription>
                        Voce tem certeza que deseja deletar essa ótica (<span className="italic">Possui {props.opticalShopData.totalPatient} pacientes</span>)?
                        <span className="font-bold">Todos os dados referente á ela serão removidos do nosso banco de dados</span>.
                    </DialogDescription>
                </DialogHeader>
                <FormDeleteOpticalShop formInitialValue={{ id: props.opticalShopData.id }} onSuccess={() => props.onOpenChange(false)} />
            </DialogContent>
        </Dialog>
    )
}