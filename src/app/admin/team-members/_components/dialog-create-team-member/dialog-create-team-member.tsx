"use client";

import { useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Item } from "@/components/ui/item";
import { Plus } from "lucide-react";
import { FormCreateTeamMember } from "../form-create-team-member/form-create-team-member";
import type { OpticalShopOption } from "../client-container/client-container.types";

interface DialogCreateTeamMemberProps {
    opticalShops: OpticalShopOption[];
}

export function DialogCreateTeamMember({ opticalShops }: DialogCreateTeamMemberProps) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
                <Item className={buttonVariants()}>
                    <Plus />
                    Novo Usuário
                </Item>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Criar novo usuário</DialogTitle>
                    <DialogDescription>
                        Preencha os dados e selecione as óticas que esse usuário terá acesso.
                    </DialogDescription>
                </DialogHeader>
                <FormCreateTeamMember
                    opticalShops={opticalShops}
                    onSuccess={() => setOpen(false)}
                />
            </DialogContent>
        </Dialog>
    );
}
