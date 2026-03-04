"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EllipsisVertical, Plus, User } from "lucide-react";
import { ActionGetTeamMembers, ActionToggleTeamMemberActive } from "@/server/actions/admin/team-member.actions";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { DialogCreateTeamMember } from "../dialog-create-team-member/dialog-create-team-member";
import { DialogEditTeamMember } from "../dialog-edit-team-member/dialog-edit-team-member";
import { DialogDeleteTeamMember } from "../dialog-delete-team-member/dialog-delete-team-member";
import type {
    ClientContainerTeamMembersProps,
    TeamMemberItem,
} from "./client-container.types";

const QUERY_KEY = "teamMembersData";

const fetchTeamMembers = async (): Promise<TeamMemberItem[]> => {
    const result = await ActionGetTeamMembers();
    if (result.serverError || result.validationErrors) {
        throw new Error(result.serverError || "Erro de validação.");
    }
    return (result.data ?? []) as TeamMemberItem[];
};

export function ClientContainerTeamMembers({
    initialMembers,
    opticalShops,
}: ClientContainerTeamMembersProps) {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [editMember, setEditMember] = useState<TeamMemberItem | null>(null);
    const [deleteMember, setDeleteMember] = useState<TeamMemberItem | null>(null);

    const query = useQuery({
        initialData: initialMembers as TeamMemberItem[],
        queryKey: [QUERY_KEY],
        queryFn: fetchTeamMembers,
    });

    const { execute: toggleActive } = useAction(ActionToggleTeamMemberActive, {
        onSuccess: async () => {
            toast.success("Status atualizado!");
            await queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
        },
        onError: ({ error }) => {
            toast.error(error.serverError ?? "Erro ao alterar status.");
        },
    });

    const filtered = (query.data ?? []).filter((m) => {
        const q = search.toLowerCase();
        return (
            m.fullName.toLowerCase().includes(q) ||
            m.email.toLowerCase().includes(q)
        );
    });

    return (
        <>
            {/* Page header */}
            <div className="flex flex-col gap-4 h-[128px] justify-center">
                <div className="flex justify-between items-center">
                    <div className="text-xl uppercase font-bold">Usuários</div>
                    <DialogCreateTeamMember opticalShops={opticalShops} />
                </div>
                <div className="flex justify-between gap-4">
                    <Input
                        className="w-full md:max-w-md"
                        type="search"
                        placeholder="Busque pelo nome ou e-mail..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>E-mail</TableHead>
                            <TableHead>Óticas</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[60px]" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                    Nenhum usuário encontrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((member) => (
                                <TableRow key={member.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            {member.fullName}
                                        </div>
                                    </TableCell>
                                    <TableCell>{member.email}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {member.opticalShops.length === 0 ? (
                                                <span className="text-muted-foreground text-sm">—</span>
                                            ) : (
                                                member.opticalShops.map((shop) => (
                                                    <Badge key={shop.id} variant="outline" className="text-xs">
                                                        {shop.name}
                                                    </Badge>
                                                ))
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={member.active ? "default" : "destructive"}>
                                            {member.active ? "Ativo" : "Bloqueado"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <EllipsisVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => setEditMember(member)}>
                                                    Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        toggleActive({
                                                            id: member.id,
                                                            active: !member.active,
                                                        })
                                                    }
                                                >
                                                    {member.active ? "Bloquear" : "Desbloquear"}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-destructive"
                                                    onClick={() => setDeleteMember(member)}
                                                >
                                                    Excluir
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Dialogs */}
            {editMember && (
                <DialogEditTeamMember
                    isOpen={!!editMember}
                    onOpenChange={(open) => !open && setEditMember(null)}
                    member={editMember}
                    opticalShops={opticalShops}
                />
            )}
            {deleteMember && (
                <DialogDeleteTeamMember
                    isOpen={!!deleteMember}
                    onOpenChange={(open) => !open && setDeleteMember(null)}
                    member={deleteMember}
                />
            )}
        </>
    );
}
