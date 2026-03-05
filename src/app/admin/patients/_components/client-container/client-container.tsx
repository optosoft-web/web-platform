"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import {
    ActionGetAllPatients,
} from "@/server/actions/admin/patient.actions";
import { getPatientDetails } from "@/server/actions/admin/patient.actions";
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
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import {
    ChevronDown,
    ChevronRight,
    Filter,
    Printer,
    Store,
    UserPlus,
    X,
} from "lucide-react";
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
import { DialogCreatePatient } from "@/app/admin/optical-shop/[id]/_components/dialog-create-patient/dialog.create-patient";
import Link from "next/link";

// ── Types ──

interface PrescriptionDetail {
    id: string;
    rightEyeSpherical: string | null;
    rightEyeCylindrical: string | null;
    rightEyeAxis: number | null;
    leftEyeSpherical: string | null;
    leftEyeCylindrical: string | null;
    leftEyeAxis: number | null;
    addition: string | null;
    dnpRight: string | null;
    dnpLeft: string | null;
    notes: string | null;
    prescribedBy: string | null;
    prescriptionDate: string;
    opticalShopId: string;
}

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

// ── Helpers ──

function formatValue(v: string | number | null | undefined) {
    if (v === null || v === undefined || v === "") return "-";
    return String(v);
}

// ── Component ──

export function ClientContainerPatients({ shops }: ClientContainerPatientsProps) {
    const [patients, setPatients] = useState<PatientRow[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 400);

    // Filter state
    const [filterShopId, setFilterShopId] = useState<string>("");
    const [showFilters, setShowFilters] = useState(false);
    const hasActiveFilters = !!filterShopId;

    function clearFilters() {
        setFilterShopId("");
    }

    // Expandable row state
    const [expandedPatientId, setExpandedPatientId] = useState<string | null>(null);
    const [expandedPrescriptions, setExpandedPrescriptions] = useState<PrescriptionDetail[]>([]);
    const [expandedLoading, setExpandedLoading] = useState(false);
    const [expandedPatientData, setExpandedPatientData] = useState<{
        fullName: string;
        phone: string | null;
        cpf: string | null;
        rg: string | null;
    } | null>(null);

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

    const detailAction = useAction(getPatientDetails, {
        onSuccess: ({ data: result }) => {
            if (result) {
                const r = result as unknown as {
                    fullName: string;
                    phone: string | null;
                    cpf: string | null;
                    rg: string | null;
                    prescriptions: PrescriptionDetail[];
                };
                setExpandedPrescriptions(r.prescriptions);
                setExpandedPatientData({
                    fullName: r.fullName,
                    phone: r.phone,
                    cpf: r.cpf,
                    rg: r.rg,
                });
            }
            setExpandedLoading(false);
        },
        onError: () => {
            toast.error("Erro ao buscar receitas do paciente.");
            setExpandedLoading(false);
        },
    });

    const fetchData = useCallback(() => {
        setIsLoading(true);
        getAction.execute({
            limit: pageSize,
            offset: page * pageSize,
            search: debouncedSearch || undefined,
            opticalShopId: filterShopId || undefined,
        });
    }, [page, debouncedSearch, filterShopId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Reset page when search/filters change
    useEffect(() => {
        setPage(0);
    }, [debouncedSearch, filterShopId]);

    function toggleExpand(patientId: string) {
        if (expandedPatientId === patientId) {
            setExpandedPatientId(null);
            setExpandedPrescriptions([]);
            setExpandedPatientData(null);
            return;
        }
        setExpandedPatientId(patientId);
        setExpandedLoading(true);
        setExpandedPrescriptions([]);
        setExpandedPatientData(null);
        detailAction.execute({ id: patientId });
    }

    function handlePrintRx(rx: PrescriptionDetail) {
        const printWindow = window.open("", "_blank", "width=800,height=600");
        if (!printWindow || !expandedPatientData) return;

        const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Receita - ${expandedPatientData.fullName}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1a1a1a; }
        .header { text-align: center; margin-bottom: 32px; border-bottom: 2px solid #333; padding-bottom: 16px; }
        .header h1 { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
        .patient-info { margin-bottom: 24px; }
        .patient-info h2 { font-size: 18px; margin-bottom: 8px; }
        .patient-info .detail { font-size: 13px; color: #555; margin-bottom: 2px; }
        .rx-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        .rx-table th, .rx-table td { border: 1px solid #ccc; padding: 8px 12px; text-align: center; font-size: 14px; }
        .rx-table th { background: #f5f5f5; font-weight: 600; }
        .notes { margin-bottom: 16px; }
        .notes h3 { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
        .notes p { font-size: 13px; color: #444; white-space: pre-wrap; }
        .footer { margin-top: 48px; display: flex; justify-content: space-between; font-size: 12px; color: #888; }
        .signature { margin-top: 64px; text-align: center; }
        .signature .line { border-top: 1px solid #333; width: 250px; margin: 0 auto 4px; }
        .signature p { font-size: 13px; }
        @media print { body { padding: 20px; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>Prescrição de lentes</h1>
    </div>
    <div class="patient-info">
        <h2>${expandedPatientData.fullName}</h2>
        ${expandedPatientData.phone ? `<div class="detail">Telefone: ${expandedPatientData.phone}</div>` : ""}
        ${expandedPatientData.cpf ? `<div class="detail">CPF: ${expandedPatientData.cpf}</div>` : ""}
        <div class="detail">Data: ${formatDate(new Date(rx.prescriptionDate))}</div>
    </div>
    <table class="rx-table">
        <thead>
            <tr>
                <th></th>
                <th>Esférico</th>
                <th>Cilíndrico</th>
                <th>Eixo</th>
                <th>DNP</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><strong>OD</strong></td>
                <td>${formatValue(rx.rightEyeSpherical)}</td>
                <td>${formatValue(rx.rightEyeCylindrical)}</td>
                <td>${rx.rightEyeAxis !== null ? rx.rightEyeAxis + "°" : "-"}</td>
                <td>${formatValue(rx.dnpRight)}</td>
            </tr>
            <tr>
                <td><strong>OE</strong></td>
                <td>${formatValue(rx.leftEyeSpherical)}</td>
                <td>${formatValue(rx.leftEyeCylindrical)}</td>
                <td>${rx.leftEyeAxis !== null ? rx.leftEyeAxis + "°" : "-"}</td>
                <td>${formatValue(rx.dnpLeft)}</td>
            </tr>
        </tbody>
    </table>
    ${rx.addition ? `<p style="margin-bottom:24px;font-size:14px;"><strong>Adição:</strong> ${rx.addition}</p>` : ""}
    ${rx.notes ? `<div class="notes"><h3>Observações</h3><p>${rx.notes}</p></div>` : ""}
    ${rx.prescribedBy ? `
    <div class="signature">
        <div class="line"></div>
        <p>${rx.prescribedBy}</p>
    </div>
    ` : ""}
    <div class="footer">
        ${rx.prescribedBy ? `<span>${rx.prescribedBy}</span>` : ""}
        <span>Emitido em ${formatDate(new Date())}</span>
    </div>
</body>
</html>`;

        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 300);
    }

    const pageCount = Math.ceil(totalCount / pageSize);

    return (
        <>
            {/* Header */}
            <div className="flex flex-col gap-4 justify-center">
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

                {/* Search + filter toggle */}
                <div className="flex items-center gap-2">
                    <Input
                        className="flex-1 md:max-w-md"
                        type="search"
                        placeholder="Buscar por nome, telefone ou CPF..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {shops.length > 1 && (
                        <Button
                            variant={hasActiveFilters ? "default" : "outline"}
                            size="icon"
                            onClick={() => setShowFilters((v) => !v)}
                            title="Filtros"
                        >
                            <Filter className="h-4 w-4" />
                        </Button>
                    )}
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
                {showFilters && shops.length > 1 && (
                    <div className="flex flex-wrap items-end gap-3 rounded-md border p-3 bg-muted/30">
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
                    </div>
                )}
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
                    <Spinner className="size-8" />
                    <span className="text-sm">Carregando pacientes...</span>
                </div>
            ) : patients.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    {debouncedSearch || filterShopId
                        ? "Nenhum paciente encontrado para essa busca."
                        : "Nenhum paciente cadastrado ainda."}
                </div>
            ) : (
                <>
                    <div className="rounded-md border mt-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[40px]"></TableHead>
                                    <TableHead>Nome</TableHead>
                                    <TableHead className="hidden sm:table-cell">Telefone</TableHead>
                                    <TableHead className="hidden md:table-cell">CPF</TableHead>
                                    <TableHead className="hidden lg:table-cell">Ótica(s)</TableHead>
                                    <TableHead className="hidden sm:table-cell">Receitas</TableHead>
                                    <TableHead className="hidden md:table-cell">Última Receita</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {patients.map((patient, index) => (
                                    <Fragment key={`${patient.id}-${index}`}>
                                        <TableRow
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={() => toggleExpand(patient.id)}
                                        >
                                            <TableCell className="w-[40px] pr-0">
                                                {expandedPatientId === patient.id ? (
                                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                ) : (
                                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                                )}
                                            </TableCell>
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
                                                                onClick={(e) => e.stopPropagation()}
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
                                        </TableRow>

                                        {/* Expanded prescriptions row */}
                                        {expandedPatientId === patient.id && (
                                            <TableRow key={`${patient.id}-expanded`}>
                                                <TableCell
                                                    colSpan={7}
                                                    className="p-0 bg-muted/20"
                                                >
                                                    <div className="px-4 py-3 pl-12">
                                                        {expandedLoading ? (
                                                            <div className="flex items-center gap-2 py-4 text-muted-foreground">
                                                                <Spinner className="size-5" />
                                                                <span className="text-sm">Carregando receitas...</span>
                                                            </div>
                                                        ) : expandedPrescriptions.length === 0 ? (
                                                            <p className="text-sm text-muted-foreground py-2">
                                                                Nenhuma receita registrada para este paciente.
                                                            </p>
                                                        ) : (
                                                            <div className="space-y-3">
                                                                <h4 className="text-sm font-semibold">
                                                                    Histórico de Receitas ({expandedPrescriptions.length})
                                                                </h4>
                                                                {expandedPrescriptions.map((rx) => (
                                                                    <div
                                                                        key={rx.id}
                                                                        className="rounded-md border overflow-hidden text-sm bg-background"
                                                                    >
                                                                        <div className="flex items-center justify-between px-3 py-2 bg-muted/40">
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="font-medium">
                                                                                    {formatDate(new Date(rx.prescriptionDate))}
                                                                                </span>
                                                                                {rx.prescribedBy && (
                                                                                    <span className="text-muted-foreground text-xs">
                                                                                        por {rx.prescribedBy}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                className="h-7 px-2"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handlePrintRx(rx);
                                                                                }}
                                                                            >
                                                                                <Printer className="h-3.5 w-3.5 mr-1" />
                                                                                Imprimir
                                                                            </Button>
                                                                        </div>
                                                                        <table className="w-full">
                                                                            <thead>
                                                                                <tr className="border-t bg-muted/20">
                                                                                    <th className="text-left p-2 font-medium w-12"></th>
                                                                                    <th className="p-2 font-medium text-center">Esférico</th>
                                                                                    <th className="p-2 font-medium text-center">Cilíndrico</th>
                                                                                    <th className="p-2 font-medium text-center">Eixo</th>
                                                                                    <th className="p-2 font-medium text-center">DNP</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                <tr className="border-t">
                                                                                    <td className="p-2 font-semibold">OD</td>
                                                                                    <td className="p-2 text-center">{formatValue(rx.rightEyeSpherical)}</td>
                                                                                    <td className="p-2 text-center">{formatValue(rx.rightEyeCylindrical)}</td>
                                                                                    <td className="p-2 text-center">
                                                                                        {rx.rightEyeAxis !== null ? `${rx.rightEyeAxis}°` : "-"}
                                                                                    </td>
                                                                                    <td className="p-2 text-center">{formatValue(rx.dnpRight)}</td>
                                                                                </tr>
                                                                                <tr className="border-t">
                                                                                    <td className="p-2 font-semibold">OE</td>
                                                                                    <td className="p-2 text-center">{formatValue(rx.leftEyeSpherical)}</td>
                                                                                    <td className="p-2 text-center">{formatValue(rx.leftEyeCylindrical)}</td>
                                                                                    <td className="p-2 text-center">
                                                                                        {rx.leftEyeAxis !== null ? `${rx.leftEyeAxis}°` : "-"}
                                                                                    </td>
                                                                                    <td className="p-2 text-center">{formatValue(rx.dnpLeft)}</td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                        {rx.addition && (
                                                                            <div className="px-3 py-1.5 border-t text-xs">
                                                                                <span className="text-muted-foreground">Adição:</span>{" "}
                                                                                <span className="font-medium">{rx.addition}</span>
                                                                            </div>
                                                                        )}
                                                                        {rx.notes && (
                                                                            <div className="px-3 py-1.5 border-t text-xs">
                                                                                <span className="text-muted-foreground">Obs:</span>{" "}
                                                                                <span>{rx.notes}</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </Fragment>
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
