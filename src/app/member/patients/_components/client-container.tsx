"use client";

import { useCallback, useEffect, useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import {
    ActionMemberGetPatients,
    ActionMemberGetPatientDetail,
    ActionMemberUpdatePatient,
    ActionMemberGetMyShops,
    ActionMemberCreatePatient,
} from "@/server/actions/member/member.actions";
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
import { Separator } from "@/components/ui/separator";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils";
import { Eye, Pencil, Plus, Printer, Store } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

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

interface PatientDetail {
    id: string;
    fullName: string;
    phone: string | null;
    cpf: string | null;
    rg: string | null;
    dateOfBirth: string | null;
    contactInfo: string | null;
    createdAt: Date;
    prescriptions: {
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
    }[];
    patientOpticalShops: {
        opticalShop: {
            id: string;
            name: string;
        };
    }[];
}

// ── Helpers ──

function formatValue(v: string | number | null | undefined) {
    if (v === null || v === undefined || v === "") return "-";
    return String(v);
}

// ── Component ──

export function MemberPatientsClient() {
    const [patients, setPatients] = useState<PatientRow[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 400);

    // Detail dialog
    const [detailData, setDetailData] = useState<PatientDetail | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);

    function handlePrintRx(rx: PatientDetail["prescriptions"][number]) {
        const printWindow = window.open("", "_blank", "width=800,height=600");
        if (!printWindow) return;

        const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Receita - ${detailData?.fullName ?? ""}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1a1a1a; }
        .header { text-align: center; margin-bottom: 32px; border-bottom: 2px solid #333; padding-bottom: 16px; }
        .header h1 { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
        .header p { font-size: 14px; color: #666; }
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
        <h2>${detailData?.fullName ?? ""}</h2>
        ${detailData?.phone ? `<div class="detail">Telefone: ${detailData.phone}</div>` : ""}
        ${detailData?.cpf ? `<div class="detail">CPF: ${detailData.cpf}</div>` : ""}
        ${detailData?.rg ? `<div class="detail">RG: ${detailData.rg}</div>` : ""}
        <div class="detail">Data: ${formatDate(rx.prescriptionDate)}</div>
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

    // Edit dialog
    const [editOpen, setEditOpen] = useState(false);
    const [editData, setEditData] = useState({
        id: "",
        fullName: "",
        phone: "",
        cpf: "",
        rg: "",
        dateOfBirth: "",
        contactInfo: "",
    });

    // Create dialog
    const [createOpen, setCreateOpen] = useState(false);
    const [createData, setCreateData] = useState({
        fullName: "",
        phone: "",
        cpf: "",
        rg: "",
        dateOfBirth: "",
        contactInfo: "",
        opticalShopId: "",
    });
    const [myShops, setMyShops] = useState<{ id: string; name: string }[]>([]);

    const pageSize = 15;

    const getAction = useAction(ActionMemberGetPatients, {
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

    const detailAction = useAction(ActionMemberGetPatientDetail, {
        onSuccess: ({ data }) => {
            if (data) {
                setDetailData(data as unknown as PatientDetail);
                setDetailOpen(true);
            }
        },
        onError: () => {
            toast.error("Erro ao buscar detalhes do paciente.");
        },
    });

    const updateAction = useAction(ActionMemberUpdatePatient, {
        onSuccess: () => {
            toast.success("Paciente atualizado com sucesso.");
            setEditOpen(false);
            fetchData();
        },
        onError: () => {
            toast.error("Erro ao atualizar paciente.");
        },
    });

    const shopsAction = useAction(ActionMemberGetMyShops, {
        onSuccess: ({ data }) => {
            if (data) setMyShops(data);
        },
    });

    const createAction = useAction(ActionMemberCreatePatient, {
        onSuccess: () => {
            toast.success("Paciente criado com sucesso.");
            setCreateOpen(false);
            fetchData();
        },
        onError: () => {
            toast.error("Erro ao criar paciente.");
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

    useEffect(() => {
        setPage(0);
    }, [debouncedSearch]);

    useEffect(() => {
        shopsAction.execute();
    }, []);

    const pageCount = Math.ceil(totalCount / pageSize);

    function handleViewDetail(id: string) {
        setDetailData(null);
        detailAction.execute({ id });
    }

    function handleEditOpen(patient: PatientRow) {
        setEditData({
            id: patient.id,
            fullName: patient.fullName,
            phone: patient.phone || "",
            cpf: patient.cpf || "",
            rg: "",
            dateOfBirth: patient.dateOfBirth || "",
            contactInfo: "",
        });
        setEditOpen(true);
    }

    function handleEditOpenFromDetail() {
        if (!detailData) return;
        setEditData({
            id: detailData.id,
            fullName: detailData.fullName,
            phone: detailData.phone || "",
            cpf: detailData.cpf || "",
            rg: detailData.rg || "",
            dateOfBirth: detailData.dateOfBirth || "",
            contactInfo: detailData.contactInfo || "",
        });
        setDetailOpen(false);
        setEditOpen(true);
    }

    function handleEditSubmit(e: React.FormEvent) {
        e.preventDefault();
        updateAction.execute({
            id: editData.id,
            fullName: editData.fullName,
            phone: editData.phone || undefined,
            cpf: editData.cpf || undefined,
            rg: editData.rg || undefined,
            dateOfBirth: editData.dateOfBirth || undefined,
            contactInfo: editData.contactInfo || undefined,
        });
    }

    function handleCreateOpen() {
        setCreateData({
            fullName: "",
            phone: "",
            cpf: "",
            rg: "",
            dateOfBirth: "",
            contactInfo: "",
            opticalShopId: myShops.length === 1 ? myShops[0].id : "",
        });
        setCreateOpen(true);
    }

    function handleCreateSubmit(e: React.FormEvent) {
        e.preventDefault();
        createAction.execute({
            fullName: createData.fullName,
            phone: createData.phone || undefined,
            cpf: createData.cpf || undefined,
            rg: createData.rg || undefined,
            dateOfBirth: createData.dateOfBirth || undefined,
            contactInfo: createData.contactInfo || undefined,
            opticalShopId: createData.opticalShopId,
        });
    }

    return (
        <>
            {/* Header */}
            <div className="flex flex-col gap-4 h-[128px] justify-center">
                <div className="flex justify-between items-center">
                    <div className="text-xl uppercase font-bold">Pacientes</div>
                    <Button onClick={handleCreateOpen}>
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Paciente
                    </Button>
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
                        : "Nenhum paciente disponível."}
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
                                    <TableHead className="w-[80px]"></TableHead>
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
                                                        <Badge
                                                            key={shop.id}
                                                            variant="secondary"
                                                            className="text-xs"
                                                        >
                                                            <Store className="h-3 w-3 mr-1" />
                                                            {shop.name}
                                                        </Badge>
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
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => handleViewDetail(patient.id)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => handleEditOpen(patient)}
                                                >
                                                    <Pencil className="h-4 w-4" />
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

            {/* Patient detail dialog */}
            <Dialog
                open={detailOpen}
                onOpenChange={(open) => {
                    setDetailOpen(open);
                    if (!open) setDetailData(null);
                }}
            >
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-between">
                            <span>
                                {detailAction.isPending ? (
                                    <Skeleton className="h-6 w-48" />
                                ) : (
                                    detailData?.fullName ?? "Detalhes do Paciente"
                                )}
                            </span>
                            {detailData && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleEditOpenFromDetail}
                                    className="mr-6"
                                >
                                    <Pencil className="h-4 w-4 mr-1" />
                                    Editar
                                </Button>
                            )}
                        </DialogTitle>
                    </DialogHeader>

                    {detailAction.isPending ? (
                        <div className="space-y-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-32 w-full" />
                        </div>
                    ) : detailData ? (
                        <div className="space-y-5">
                            {/* Patient info */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                {detailData.phone && (
                                    <div>
                                        <span className="text-muted-foreground">Telefone:</span>{" "}
                                        <span className="font-medium">{detailData.phone}</span>
                                    </div>
                                )}
                                {detailData.cpf && (
                                    <div>
                                        <span className="text-muted-foreground">CPF:</span>{" "}
                                        <span className="font-medium">{detailData.cpf}</span>
                                    </div>
                                )}
                                {detailData.rg && (
                                    <div>
                                        <span className="text-muted-foreground">RG:</span>{" "}
                                        <span className="font-medium">{detailData.rg}</span>
                                    </div>
                                )}
                                {detailData.dateOfBirth && (
                                    <div>
                                        <span className="text-muted-foreground">Nascimento:</span>{" "}
                                        <span className="font-medium">
                                            {formatDate(detailData.dateOfBirth)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Linked optical shops */}
                            {detailData.patientOpticalShops.length > 0 && (
                                <div className="space-y-2">
                                    <span className="text-sm text-muted-foreground font-medium">
                                        Óticas vinculadas
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                        {detailData.patientOpticalShops.map((pos) => (
                                            <Badge
                                                key={pos.opticalShop.id}
                                                variant="secondary"
                                            >
                                                <Store className="h-3 w-3 mr-1" />
                                                {pos.opticalShop.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <Separator />

                            {/* Prescriptions history */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold">
                                    Histórico de Receitas ({detailData.prescriptions.length})
                                </h3>

                                {detailData.prescriptions.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        Nenhuma receita registrada.
                                    </p>
                                ) : (
                                    <div className="space-y-4">
                                        {detailData.prescriptions.map((rx) => (
                                            <div
                                                key={rx.id}
                                                className="rounded-md border overflow-hidden text-sm"
                                            >
                                                <div className="flex items-center justify-between px-3 py-2 bg-muted/40">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">
                                                            {formatDate(rx.prescriptionDate)}
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
                                                        onClick={() => handlePrintRx(rx)}
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
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            Não foi possível carregar os dados do paciente.
                        </p>
                    )}
                </DialogContent>
            </Dialog>

            {/* Create patient dialog */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Novo Paciente</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="create-fullName">Nome completo *</Label>
                            <Input
                                id="create-fullName"
                                value={createData.fullName}
                                onChange={(e) =>
                                    setCreateData((prev) => ({ ...prev, fullName: e.target.value }))
                                }
                                required
                                minLength={3}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="create-phone">Telefone</Label>
                                <Input
                                    id="create-phone"
                                    value={createData.phone}
                                    onChange={(e) =>
                                        setCreateData((prev) => ({ ...prev, phone: e.target.value }))
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="create-cpf">CPF</Label>
                                <Input
                                    id="create-cpf"
                                    value={createData.cpf}
                                    onChange={(e) =>
                                        setCreateData((prev) => ({ ...prev, cpf: e.target.value }))
                                    }
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="create-rg">RG</Label>
                                <Input
                                    id="create-rg"
                                    value={createData.rg}
                                    onChange={(e) =>
                                        setCreateData((prev) => ({ ...prev, rg: e.target.value }))
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="create-dob">Nascimento</Label>
                                <Input
                                    id="create-dob"
                                    type="date"
                                    value={createData.dateOfBirth}
                                    onChange={(e) =>
                                        setCreateData((prev) => ({
                                            ...prev,
                                            dateOfBirth: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                        </div>
                        {myShops.length > 1 && (
                            <div className="space-y-2">
                                <Label>Ótica *</Label>
                                <Select
                                    value={createData.opticalShopId}
                                    onValueChange={(v) =>
                                        setCreateData((prev) => ({ ...prev, opticalShopId: v }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione a ótica" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {myShops.map((shop) => (
                                            <SelectItem key={shop.id} value={shop.id}>
                                                {shop.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        {myShops.length === 1 && (
                            <div className="space-y-2">
                                <Label>Ótica</Label>
                                <div className="flex items-center gap-2 text-sm">
                                    <Store className="h-4 w-4 text-muted-foreground" />
                                    {myShops[0].name}
                                </div>
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="create-contactInfo">Informações adicionais</Label>
                            <Textarea
                                id="create-contactInfo"
                                value={createData.contactInfo}
                                onChange={(e) =>
                                    setCreateData((prev) => ({ ...prev, contactInfo: e.target.value }))
                                }
                            />
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setCreateOpen(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={createAction.isPending || !createData.opticalShopId}
                            >
                                {createAction.isPending ? "Criando..." : "Criar"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit patient dialog */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Editar Paciente</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-fullName">Nome completo *</Label>
                            <Input
                                id="edit-fullName"
                                value={editData.fullName}
                                onChange={(e) =>
                                    setEditData((prev) => ({ ...prev, fullName: e.target.value }))
                                }
                                required
                                minLength={3}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-phone">Telefone</Label>
                                <Input
                                    id="edit-phone"
                                    value={editData.phone}
                                    onChange={(e) =>
                                        setEditData((prev) => ({ ...prev, phone: e.target.value }))
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-cpf">CPF</Label>
                                <Input
                                    id="edit-cpf"
                                    value={editData.cpf}
                                    onChange={(e) =>
                                        setEditData((prev) => ({ ...prev, cpf: e.target.value }))
                                    }
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-rg">RG</Label>
                                <Input
                                    id="edit-rg"
                                    value={editData.rg}
                                    onChange={(e) =>
                                        setEditData((prev) => ({ ...prev, rg: e.target.value }))
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-dob">Nascimento</Label>
                                <Input
                                    id="edit-dob"
                                    type="date"
                                    value={editData.dateOfBirth}
                                    onChange={(e) =>
                                        setEditData((prev) => ({
                                            ...prev,
                                            dateOfBirth: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditOpen(false)}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={updateAction.isPending}>
                                {updateAction.isPending ? "Salvando..." : "Salvar"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
