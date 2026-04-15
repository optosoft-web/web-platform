"use client";

import { useCallback, useEffect, useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
    ActionGetPrescriptions,
    ActionDeletePrescription,
} from "@/server/actions/admin/prescription.actions";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { formatDate } from "@/lib/utils";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { DialogPrescriptionDetail } from "../dialog-prescription-detail/dialog.prescription-detail";
import { SheetEditPrescription } from "../sheet-edit-prescription/sheet.edit-prescription";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PrescriptionRow {
    id: string;
    patientId: string;
    patientName: string;
    rightEyeSpherical: string | null;
    rightEyeCylindrical: string | null;
    rightEyeAxis: number | null;
    leftEyeSpherical: string | null;
    leftEyeCylindrical: string | null;
    leftEyeAxis: number | null;
    addition: string | null;
    prescribedBy: string | null;
    prescriptionDate: string;
    createdAt: Date;
}

interface TablePrescriptionsProps {
    opticalShopId: string;
    refreshKey?: number;
}

function formatEye(sph: string | null, cyl: string | null, axis: number | null) {
    if (!sph && !cyl) return "-";
    const parts: string[] = [];
    if (sph) parts.push(sph);
    if (cyl) parts.push(cyl);
    if (axis !== null && axis !== undefined) parts.push(`x${axis}°`);
    return parts.join(" ");
}

export function TablePrescriptions({ opticalShopId, refreshKey }: TablePrescriptionsProps) {
    const queryClient = useQueryClient();
    const [prescriptions, setPrescriptions] = useState<PrescriptionRow[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [detailId, setDetailId] = useState<string | null>(null);
    const [editId, setEditId] = useState<string | null>(null);
    const pageSize = 10;

    const getAction = useAction(ActionGetPrescriptions, {
        onSuccess: ({ data }) => {
            if (data) {
                setPrescriptions(data.data as PrescriptionRow[]);
                setTotalCount(data.totalCount);
            }
            setIsLoading(false);
        },
        onError: () => {
            toast.error("Erro ao buscar receitas.");
            setIsLoading(false);
        },
    });

    const deleteAction = useAction(ActionDeletePrescription, {
        onSuccess: () => {
            toast.success("Receita excluída.");
            queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
            fetchData();
        },
        onError: () => {
            toast.error("Erro ao excluir receita.");
        },
    });

    const fetchData = useCallback(() => {
        setIsLoading(true);
        getAction.execute({
            opticalShopId,
            limit: pageSize,
            offset: page * pageSize,
        });
    }, [opticalShopId, page, refreshKey]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const pageCount = Math.ceil(totalCount / pageSize);

    // ── Delete confirmation state ──
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; patientName: string } | null>(null);

    function handleDelete(rx: { id: string; patientName: string }) {
        setDeleteTarget(rx);
    }

    function confirmDelete() {
        if (deleteTarget) {
            deleteAction.execute({ id: deleteTarget.id });
            setDeleteTarget(null);
        }
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
                <Spinner className="size-8" />
                <span className="text-sm">Carregando receitas...</span>
            </div>
        );
    }

    if (prescriptions.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                Nenhuma receita encontrada nesta ótica.
            </div>
        );
    }

    return (
        <>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Paciente</TableHead>
                            <TableHead className="hidden md:table-cell">OD</TableHead>
                            <TableHead className="hidden md:table-cell">OE</TableHead>
                            <TableHead className="hidden lg:table-cell">Adição</TableHead>
                            <TableHead className="hidden lg:table-cell">Prescrito por</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead className="w-[80px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {prescriptions.map((rx) => (
                            <TableRow key={rx.id}>
                                <TableCell className="font-medium">{rx.patientName}</TableCell>
                                <TableCell className="hidden md:table-cell text-sm">
                                    {formatEye(rx.rightEyeSpherical, rx.rightEyeCylindrical, rx.rightEyeAxis)}
                                </TableCell>
                                <TableCell className="hidden md:table-cell text-sm">
                                    {formatEye(rx.leftEyeSpherical, rx.leftEyeCylindrical, rx.leftEyeAxis)}
                                </TableCell>
                                <TableCell className="hidden lg:table-cell text-sm">
                                    {rx.addition || "0"}
                                </TableCell>
                                <TableCell className="hidden lg:table-cell text-sm">
                                    {rx.prescribedBy || "-"}
                                </TableCell>
                                <TableCell className="text-sm">
                                    {formatDate(rx.prescriptionDate)}
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => setDetailId(rx.id)}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => setEditId(rx.id)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                            onClick={() => handleDelete({ id: rx.id, patientName: rx.patientName })}
                                            disabled={deleteAction.isPending}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {pageCount > 1 && (
                <div className="flex items-center justify-between mt-4">
                    <span className="text-sm text-muted-foreground">
                        Página {page + 1} de {pageCount}
                    </span>
                    <div className="space-x-2">
                        <Button
                            onClick={() => setPage((p) => Math.max(0, p - 1))}
                            disabled={page === 0}
                        >
                            Anterior
                        </Button>
                        <Button
                            onClick={() => setPage((p) => p + 1)}
                            disabled={page + 1 >= pageCount}
                        >
                            Próxima
                        </Button>
                    </div>
                </div>
            )}

            {/* Detail dialog */}
            <DialogPrescriptionDetail
                prescriptionId={detailId}
                open={!!detailId}
                onOpenChange={(open) => {
                    if (!open) setDetailId(null);
                }}
                onEdit={(id) => {
                    setDetailId(null);
                    setEditId(id);
                }}
            />

            {/* Edit prescription sheet */}
            <SheetEditPrescription
                prescriptionId={editId}
                open={!!editId}
                onOpenChange={(open) => {
                    if (!open) {
                        setEditId(null);
                        fetchData();
                    }
                }}
            />

            {/* Delete confirmation */}
            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir receita</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir a receita de{" "}
                            <strong>{deleteTarget?.patientName}</strong>? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-destructive text-white hover:bg-destructive/90"
                        >
                            Excluir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
