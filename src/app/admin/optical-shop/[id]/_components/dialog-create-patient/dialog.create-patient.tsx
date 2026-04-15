import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { iDialogCreatePatientProps } from "./dialog.create-patient.types"
import { FormCreatePatient } from "../form-create-patient/form.create-patient"

export function DialogCreatePatient(props: iDialogCreatePatientProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const isControlled = props.open !== undefined;
    const open = isControlled ? props.open : internalOpen;
    const setOpen = isControlled ? (props.onOpenChange ?? (() => {})) : setInternalOpen;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {props.children && (
                <DialogTrigger asChild>
                    {props.children}
                </DialogTrigger>
            )}
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Cadastrar novo paciente</DialogTitle>
                    <DialogDescription>
                        Preencha o formulário abaixo para cadastrar um novo paciente.
                    </DialogDescription>
                </DialogHeader>
                <FormCreatePatient
                    opticalShopId={props.opticalShopId}
                    onSuccess={() => {
                        setOpen(false);
                        props.onSuccess?.();
                    }}
                />
            </DialogContent>
        </Dialog>
    )
}