"use client";

import { useCallback, useEffect, useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
    ActionGetAllUserPrescriptions,
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
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { formatDate } from "@/lib/utils";
import { Eye, Filter, Plus, Store, Trash2, UserPlus, X } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { SheetCreatePrescription } from "@/app/admin/optical-shop/[id]/_components/sheet-create-prescription/sheet.create-prescription";
import { DialogCreatePatient } from "@/app/admin/optical-shop/[id]/_components/dialog-create-patient/dialog.create-patient";
import { DialogPrescriptionDetail } from "@/app/admin/optical-shop/[id]/_components/dialog-prescription-detail/dialog.prescription-detail";
import Link from "next/link";

// ── Types ──

interface PrescriptionRow {
    id: string;
    patientId: string;
    patientName: string;
    opticalShopId: string;
    opticalShopName: string;
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

interface Shop {
    id: string;
    name: string;
}

interface ClientContainerPrescriptionsProps {
    shops: Shop[];
}

// ── Helpers ──

function formatEye(sph: string | null, cyl: string | null, axis: number | null) {
    if (!sph && !cyl) return "-";
    const parts: string[] = [];
    if (sph) parts.push(sph);
    if (cyl) parts.push(cyl);
    if (axis !== null && axis !== undefined) parts.push(`x${axis}°`);
    return parts.join(" ");
}

// ── Component ──

export function ClientContainerPrescriptions({ shops }: ClientContainerPrescriptionsProps) {
    const queryClient = useQueryClient();
    const [prescriptions, setPrescriptions] = useState<PrescriptionRow[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 400);
    const [detailId, setDetailId] = useState<string | null>(null);

    // Filter state
    const [filterShopId, setFilterShopId] = useState<string>("");
    const [filterDateFrom, setFilterDateFrom] = useState<string>("");
    const [filterDateTo, setFilterDateTo] = useState<string>("");
    const [showFilters, setShowFilters] = useState(false);

    const hasActiveFilters = !!filterShopId || !!filterDateFrom || !!filterDateTo;

    function clearFilters() {
        setFilterShopId("");
        setFilterDateFrom("");
        setFilterDateTo("");
    }

    // Sheet state
    const [sheetOpen, setSheetOpen] = useState(false);
    const [selectedShopId, setSelectedShopId] = useState<string | null>(null);

    // Patient dialog state
    const [patientDialogShopId, setPatientDialogShopId] = useState<string | null>(null);

    const pageSize = 15;

    const getAction = useAction(ActionGetAllUserPrescriptions, {
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
            limit: pageSize,
            offset: page * pageSize,
            search: debouncedSearch || undefined,
            opticalShopId: filterShopId || undefined,
            dateFrom: filterDateFrom || undefined,
            dateTo: filterDateTo || undefined,
        });
    }, [page, debouncedSearch, filterShopId, filterDateFrom, filterDateTo]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Reset page when search/filters change
    useEffect(() => {
        setPage(0);
    }, [debouncedSearch, filterShopId, filterDateFrom, filterDateTo]);

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

    function handleCreateForShop(shopId: string) {
        setSelectedShopId(shopId);
        setSheetOpen(true);
    }

    return (
        <>
            {/* Header */}
            <div className="flex flex-col gap-4 justify-center">
                <div className="flex justify-between items-center">
                    <div className="text-xl uppercase font-bold">Receitas</div>
                    <div className="flex gap-2">
                        {/* Cadastrar Paciente */}
                        {shops.length === 1 ? (
                            <DialogCreatePatient opticalShopId={shops[0].id}>
                                <Button variant="outline">
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Paciente
                                </Button>
                            </DialogCreatePatient>
                        ) : shops.length > 1 ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        Paciente
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {shops.map((shop) => (
                                        <DropdownMenuItem
                                            key={shop.id}
                                            onClick={() => setPatientDialogShopId(shop.id)}
                                        >
                                            <Store className="h-4 w-4 mr-2" />
                                            {shop.name}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : null}

                        {/* Criar Receita */}
                        {shops.length === 1 ? (
                            <Button onClick={() => handleCreateForShop(shops[0].id)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Criar Receita
                            </Button>
                        ) : shops.length > 1 ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Criar Receita
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {shops.map((shop) => (
                                        <DropdownMenuItem
                                            key={shop.id}
                                            onClick={() => handleCreateForShop(shop.id)}
                                        >
                                            <Store className="h-4 w-4 mr-2" />
                                            {shop.name}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : null}
                    </div>
                </div>

                {/* Search + filter toggle */}
                <div className="flex items-center gap-2">
                    <Input
                        className="flex-1 md:max-w-md"
                        type="search"
                        placeholder="Buscar por paciente..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <Button
                        variant={hasActiveFilters ? "default" : "outline"}
                        size="icon"
                        onClick={() => setShowFilters((v) => !v)}
                        title="Filtros"
                    >
                        <Filter className="h-4 w-4" />
                    </Button>
                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="text-xs"
                        >
                            <X className="h-3 w-3 mr-1" />
                            Limpar
                        </Button>
                    )}
                </div>

                {/* Filters row */}
                {showFilters && (
                    <div className="flex flex-wrap items-end gap-3 rounded-md border p-3 bg-muted/30">
                        {shops.length > 1 && (
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">
                                    Ótica
                                </label>
                                <Select
                                    value={filterShopId}
                                    onValueChange={(v) =>
                                        setFilterShopId(v === "all" ? "" : v)
                                    }
                                >
                                    <SelectTrigger className="w-[180px] h-9">
                                        <SelectValue placeholder="Todas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todas</SelectItem>
                                        {shops.map((shop) => (
                                            <SelectItem key={shop.id} value={shop.id}>
                                                {shop.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">
                                Data de
                            </label>
                            <Input
                                type="date"
                                className="w-[160px] h-9"
                                value={filterDateFrom}
                                onChange={(e) => setFilterDateFrom(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">
                                Data até
                            </label>
                            <Input
                                type="date"
                                className="w-[160px] h-9"
                                value={filterDateTo}
                                onChange={(e) => setFilterDateTo(e.target.value)}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
                    <Spinner className="size-8" />
                    <span className="text-sm">Carregando receitas...</span>
                </div>
            ) : prescriptions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    {debouncedSearch
                        ? "Nenhuma receita encontrada para essa busca."
                        : "Nenhuma receita cadastrada ainda."}
                </div>
            ) : (
                <>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Paciente</TableHead>
                                    <TableHead className="hidden sm:table-cell">Ótica</TableHead>
                                    <TableHead className="hidden md:table-cell">OD</TableHead>
                                    <TableHead className="hidden md:table-cell">OE</TableHead>
                                    <TableHead className="hidden lg:table-cell">Adição</TableHead>
                                    <TableHead>Data</TableHead>
                                    <TableHead className="w-[80px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {prescriptions.map((rx) => (
                                    <TableRow key={rx.id}>
                                        <TableCell className="font-medium">{rx.patientName}</TableCell>
                                        <TableCell className="hidden sm:table-cell text-sm">
                                            <Link
                                                href={`/admin/optical-shop/${rx.opticalShopId}`}
                                                className="text-primary hover:underline"
                                            >
                                                {rx.opticalShopName}
                                            </Link>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell text-sm">
                                            {formatEye(rx.rightEyeSpherical, rx.rightEyeCylindrical, rx.rightEyeAxis)}
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell text-sm">
                                            {formatEye(rx.leftEyeSpherical, rx.leftEyeCylindrical, rx.leftEyeAxis)}
                                        </TableCell>
                                        <TableCell className="hidden lg:table-cell text-sm">
                                            {rx.addition || "-"}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {formatDate(new Date(rx.prescriptionDate))}
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
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                                    disabled={page === 0}
                                >
                                    Anterior
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage((p) => p + 1)}
                                    disabled={page + 1 >= pageCount}
                                >
                                    Próxima
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Detail dialog */}
            <DialogPrescriptionDetail
                prescriptionId={detailId}
                open={!!detailId}
                onOpenChange={(open) => {
                    if (!open) setDetailId(null);
                }}
            />

            {/* Create prescription sheet */}
            {selectedShopId && (
                <SheetCreatePrescription
                    open={sheetOpen}
                    onOpenChange={(open) => {
                        setSheetOpen(open);
                        if (!open) {
                            setSelectedShopId(null);
                            fetchData(); // refresh after creation
                        }
                    }}
                    opticalShopId={selectedShopId}
                />
            )}

            {/* Patient dialog (for multi-shop dropdown selection) */}
            {patientDialogShopId && (
                <DialogCreatePatient
                    opticalShopId={patientDialogShopId}
                    open={!!patientDialogShopId}
                    onOpenChange={(open) => {
                        if (!open) setPatientDialogShopId(null);
                    }}
                />
            )}

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
