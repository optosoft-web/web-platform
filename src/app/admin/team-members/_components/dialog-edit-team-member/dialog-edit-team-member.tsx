"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { FormEditTeamMember } from "../form-edit-team-member/form-edit-team-member";
import type { OpticalShopOption, TeamMemberItem } from "../client-container/client-container.types";

interface DialogEditTeamMemberProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    member: TeamMemberItem;
    opticalShops: OpticalShopOption[];
}

export function DialogEditTeamMember({
    isOpen,
    onOpenChange,
    member,
    opticalShops,
}: DialogEditTeamMemberProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Editar usuário</DialogTitle>
                    <DialogDescription>
                        Atualize os dados de {member.fullName}.
                    </DialogDescription>
                </DialogHeader>
                <FormEditTeamMember
                    member={member}
                    opticalShops={opticalShops}
                    onSuccess={() => onOpenChange(false)}
                />
            </DialogContent>
        </Dialog>
    );
}
