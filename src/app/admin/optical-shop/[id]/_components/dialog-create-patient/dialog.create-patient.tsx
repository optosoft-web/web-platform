import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { iDialogCreatePatientProps } from "./dialog.create-patient.types"

export function DialogCreatePatient(props: iDialogCreatePatientProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                {props.children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Cadastrar novo paciente</DialogTitle>
                    <DialogDescription>
                        Preencha o formulário abaixo para cadastrar um novo paciente.
                    </DialogDescription>
                </DialogHeader>
                {/* <FormCreateOpticalShop /> */}
            </DialogContent>
        </Dialog>
    )
}