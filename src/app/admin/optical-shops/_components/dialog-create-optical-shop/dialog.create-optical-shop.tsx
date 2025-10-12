"use client";

import { buttonVariants } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Item } from "@/components/ui/item"
import { Plus } from "lucide-react"
import { FormCreateOpticalShop } from "../form-create-optical-shop/form.create-optical-shop"

export function DialogCreateOpticalShop() {
    return (
        <Dialog>
            <DialogTrigger>
                <Item className={buttonVariants()}>
                    <Plus />
                    Criar Ótica
                </Item>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Criar nova ótica</DialogTitle>
                    <DialogDescription>
                        Preencha o formulário abaixo para cadastrar uma nova ótica.
                    </DialogDescription>
                </DialogHeader>
                <FormCreateOpticalShop />
            </DialogContent>
        </Dialog>
    )
}