import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { iOpticalShopCardProps, iTopicProps } from "./card-optical-shop.types";
import { buttonVariants } from "@/components/ui/button";
import { EllipsisVertical } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils";
import { DialogEditOpticalShop } from "../dialog-edit-optical-shop/dialog.edit-optical-shop";
import { useState } from "react";
import { DialogDeleteOpticalShop } from "../dialog-delete-optical-shop/dialog.delete-optical-shop";
import Link from "next/link";

function Topic(props: iTopicProps) {
    return (
        <div>
            <div className="text-muted-foreground">{props.label}</div>
            <div className="truncate" title={String(props.value)}>{props.value}</div>
        </div>
    )
}

export function OpticalShopCard(props: iOpticalShopCardProps) {
    const [dialogEditIsOpen, setDialogEditIsOpen] = useState(false);
    const [dialogDeleteIsOpen, setDialogDeleteIsOpen] = useState(false);

    return (
        <Card className="w-full shadow-none p-0">
            <CardHeader className="flex flex-row items-center justify-between pt-6">
                <CardTitle className="flex justify-between w-full">
                    <Link href={`/admin/optical-shop/${props.id}`} className="hover:underline">
                        <h2 className="font-semibold text-xl">{props.name}</h2>
                    </Link>
                    <div>
                        <DropdownMenu>
                            <DropdownMenuTrigger className={buttonVariants({ variant: 'ghost' })}>
                                <EllipsisVertical />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => setDialogEditIsOpen(true)}>Editar</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className={cn(
                                    buttonVariants({ variant: 'destructive', size: 'sm' }),
                                    'w-full justify-start'
                                )} onClick={() => setDialogDeleteIsOpen(true)}>Excluir</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="px-6 space-y-2">
                    <Topic label="Total de Pacientes" value={props.totalPatients} />
                    <Topic label="Endereço" value={props.address || '-'} />
                </div>
            </CardContent>
            <CardFooter className="border-t flex px-6 pb-0 py-2!">
                <div className="flex gap-1 text-sm">
                    <div className="text-muted-foreground">Criado em</div>
                    <div className="">{props.createdAt}</div>
                </div>
            </CardFooter>
            {/* DIALOGS */}
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
        </Card>
    );
}