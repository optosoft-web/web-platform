"use client";

import { useCallback, useEffect, useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import {
    ActionGetAllPatients,
} from "@/server/actions/admin/patient.actions";
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
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Eye, Plus, Store, UserPlus } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DialogCreatePatient } from "@/app/admin/optical-shop/[id]/_components/dialog-create-patient/dialog.create-patient";
import Link from "next/link";
import { DialogPatientDetail } from "../dialog-patient-detail/dialog.patient-detail";

// ── Types ──

interface PatientRow {
    id: string;
    fullName: string;
    phone: string | null;
    cpf: string | null;
    dateOfBirth: string | null;
    createdAt: Date;
    prescriptionCount: number;
    lastPrescriptionDate: string | null;
    opticalShops: { id: string; name: string }[];
}

interface Shop {
    id: string;
    name: string;
}

interface ClientContainerPatientsProps {
    shops: Shop[];
}

// ── Component ──

export function ClientContainerPatients({ shops }: ClientContainerPatientsProps) {
    const [patients, setPatients] = useState<PatientRow[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 400);
    const [detailPatientId, setDetailPatientId] = useState<string | null>(null);

    // Patient dialog state
    const [patientDialogShopId, setPatientDialogShopId] = useState<string | null>(null);

    const pageSize = 15;

    const getAction = useAction(ActionGetAllPatients, {
        onSuccess: ({ data }) => {
            if (data) {
                setPatients(data.data as PatientRow[]);
                setTotalCount(data.totalCount);
            }
            setIsLoading(false);
        },
        onError: () => {
            toast.error("Erro ao buscar pacientes.");
            setIsLoading(false);
        },
    });

    const fetchData = useCallback(() => {
        setIsLoading(true);
        getAction.execute({
            limit: pageSize,
            offset: page * pageSize,
            search: debouncedSearch || undefined,
        });
    }, [page, debouncedSearch]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Reset page when search changes
    useEffect(() => {
        setPage(0);
    }, [debouncedSearch]);

    const pageCount = Math.ceil(totalCount / pageSize);

    return (
        <>
            {/* Header */}
            <div className="flex flex-col gap-4 h-[128px] justify-center">
                <div className="flex justify-between items-center">
                    <div className="text-xl uppercase font-bold">Pacientes</div>
                    <div className="flex gap-2">
                        {shops.length === 1 ? (
                            <DialogCreatePatient
                                opticalShopId={shops[0].id}
                                onSuccess={fetchData}
                            >
                                <Button>
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Novo Paciente
                                </Button>
                            </DialogCreatePatient>
                        ) : shops.length > 1 ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button>
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        Novo Paciente
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
                    </div>
                </div>
                <div>
                    <Input
                        className="w-full md:max-w-md"
                        type="search"
                        placeholder="Buscar por nome, telefone ou CPF..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="space-y-3">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                    ))}
                </div>
            ) : patients.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    {debouncedSearch
                        ? "Nenhum paciente encontrado para essa busca."
                        : "Nenhum paciente cadastrado ainda."}
                </div>
            ) : (
                <>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nome</TableHead>
                                    <TableHead className="hidden sm:table-cell">Telefone</TableHead>
                                    <TableHead className="hidden md:table-cell">CPF</TableHead>
                                    <TableHead className="hidden lg:table-cell">Ótica(s)</TableHead>
                                    <TableHead className="hidden sm:table-cell">Receitas</TableHead>
                                    <TableHead className="hidden md:table-cell">Última Receita</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {patients.map((patient) => (
                                    <TableRow key={patient.id}>
                                        <TableCell className="font-medium">
                                            {patient.fullName}
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell text-sm">
                                            {patient.phone || "-"}
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell text-sm">
                                            {patient.cpf || "-"}
                                        </TableCell>
                                        <TableCell className="hidden lg:table-cell">
                                            <div className="flex flex-wrap gap-1">
                                                {patient.opticalShops.length > 0 ? (
                                                    patient.opticalShops.map((shop) => (
                                                        <Link
                                                            key={shop.id}
                                                            href={`/admin/optical-shop/${shop.id}`}
                                                        >
                                                            <Badge
                                                                variant="secondary"
                                                                className="text-xs cursor-pointer hover:bg-secondary/80"
                                                            >
                                                                {shop.name}
                                                            </Badge>
                                                        </Link>
                                                    ))
                                                ) : (
                                                    <span className="text-sm text-muted-foreground">-</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell text-sm">
                                            {patient.prescriptionCount}
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell text-sm">
                                            {patient.lastPrescriptionDate
                                                ? formatDate(new Date(patient.lastPrescriptionDate))
                                                : "-"}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => setDetailPatientId(patient.id)}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
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

            {/* Patient detail dialog */}
            <DialogPatientDetail
                patientId={detailPatientId}
                open={!!detailPatientId}
                onOpenChange={(open) => {
                    if (!open) setDetailPatientId(null);
                }}
            />

            {/* Patient dialog (for multi-shop dropdown selection) */}
            {patientDialogShopId && (
                <DialogCreatePatient
                    opticalShopId={patientDialogShopId}
                    open={!!patientDialogShopId}
                    onOpenChange={(open) => {
                        if (!open) {
                            setPatientDialogShopId(null);
                            fetchData();
                        }
                    }}
                />
            )}
        </>
    );
}
