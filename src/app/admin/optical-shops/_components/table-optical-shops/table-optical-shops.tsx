"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EllipsisVertical } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { iOpticalShopCardProps } from "../card-optical-shop/card-optical-shop.types";
import { DialogEditOpticalShop } from "../dialog-edit-optical-shop/dialog.edit-optical-shop";
import { DialogDeleteOpticalShop } from "../dialog-delete-optical-shop/dialog.delete-optical-shop";

interface TableOpticalShopsProps {
    data: iOpticalShopCardProps[];
}

function TableRowOpticalShop(props: iOpticalShopCardProps) {
    const [dialogEditIsOpen, setDialogEditIsOpen] = useState(false);
    const [dialogDeleteIsOpen, setDialogDeleteIsOpen] = useState(false);

    return (
        <>
            <TableRow>
                <TableCell className="font-medium">
                    <Link href={`/admin/optical-shop/${props.id}`} className="hover:underline">
                        {props.name}
                    </Link>
                </TableCell>
                <TableCell className="text-muted-foreground max-w-[200px] truncate">
                    {props.address || "-"}
                </TableCell>
                <TableCell>{props.totalPatients}</TableCell>
                <TableCell className="text-muted-foreground">{props.createdAt}</TableCell>
                <TableCell className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <EllipsisVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setDialogEditIsOpen(true)}>
                                Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className={cn(
                                    buttonVariants({ variant: "destructive", size: "sm" }),
                                    "w-full justify-start"
                                )}
                                onClick={() => setDialogDeleteIsOpen(true)}
                            >
                                Excluir
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
            </TableRow>

            <DialogEditOpticalShop
                isOpen={dialogEditIsOpen}
                onOpenChange={setDialogEditIsOpen}
                opticalShopData={{ id: props.id, name: props.name, address: props.address }}
            />
            <DialogDeleteOpticalShop
                isOpen={dialogDeleteIsOpen}
                onOpenChange={setDialogDeleteIsOpen}
                opticalShopData={{ id: props.id, name: props.name, totalPatient: props.totalPatients }}
            />
        </>
    );
}

export function TableOpticalShops({ data }: TableOpticalShopsProps) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Endereço</TableHead>
                        <TableHead>Pacientes</TableHead>
                        <TableHead>Criado em</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                                Nenhuma ótica encontrada.
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((item) => (
                            <TableRowOpticalShop key={item.id} {...item} />
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
