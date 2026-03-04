"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/shared/loading-button/loading-button";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { ActionDeleteTeamMember } from "@/server/actions/admin/team-member.actions";
import type { TeamMemberItem } from "../client-container/client-container.types";

interface DialogDeleteTeamMemberProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    member: TeamMemberItem;
}

export function DialogDeleteTeamMember({
    isOpen,
    onOpenChange,
    member,
}: DialogDeleteTeamMemberProps) {
    const queryClient = useQueryClient();

    const { execute, isPending } = useAction(ActionDeleteTeamMember, {
        onSuccess: async () => {
            toast.success("Usuário excluído com sucesso!");
            await queryClient.invalidateQueries({ queryKey: ["teamMembersData"] });
            onOpenChange(false);
        },
        onError: ({ error }) => {
            toast.error(error.serverError ?? "Erro ao excluir usuário.");
        },
    });

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Excluir usuário</DialogTitle>
                    <DialogDescription>
                        Tem certeza que deseja excluir <strong>{member.fullName}</strong>?
                        Esta ação não pode ser desfeita.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isPending}
                    >
                        Cancelar
                    </Button>
                    <LoadingButton
                        variant="destructive"
                        defaultText="Excluir"
                        loadingText="Excluindo..."
                        isLoading={isPending}
                        onClick={() => execute({ id: member.id })}
                    />
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
