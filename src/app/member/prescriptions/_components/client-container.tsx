"use client";

import { useCallback, useEffect, useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import {
    ActionMemberGetPrescriptions,
    ActionMemberGetPrescriptionById,
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
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import { Eye, Printer, Store } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

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

interface PrescriptionDetail {
    id: string;
    patientId: string;
    patientName: string;
    patientPhone: string | null;
    patientCpf: string | null;
    patientRg: string | null;
    opticalShopId: string;
    opticalShopName: string;
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
    createdAt: Date;
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

function formatValue(v: string | number | null | undefined) {
    if (v === null || v === undefined || v === "") return "-";
    return String(v);
}

// ── Component ──

export function MemberPrescriptionsClient() {
    const [prescriptions, setPrescriptions] = useState<PrescriptionRow[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 400);

    // Detail dialog
    const [detailData, setDetailData] = useState<PrescriptionDetail | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);

    const pageSize = 15;

    const getAction = useAction(ActionMemberGetPrescriptions, {
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

    const detailAction = useAction(ActionMemberGetPrescriptionById, {
        onSuccess: ({ data }) => {
            if (data) {
                setDetailData(data as PrescriptionDetail);
                setDetailOpen(true);
            }
        },
        onError: () => {
            toast.error("Erro ao buscar detalhes da receita.");
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

    const pageCount = Math.ceil(totalCount / pageSize);

    function handleViewDetail(id: string) {
        setDetailData(null);
        detailAction.execute({ id });
    }

    function handlePrint() {
        if (!detailData) return;
        const data = detailData;
        const printWindow = window.open("", "_blank", "width=800,height=600");
        if (!printWindow) return;

        const prescriptionHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Receita - ${data.patientName}</title>
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
                    .footer { margin-top: 48px; font-size: 12px; color: #888; }
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
                    <h2>${data.patientName}</h2>
                    ${data.patientPhone ? `<div class="detail">Telefone: ${data.patientPhone}</div>` : ""}
                    ${data.patientCpf ? `<div class="detail">CPF: ${data.patientCpf}</div>` : ""}
                    ${data.patientRg ? `<div class="detail">RG: ${data.patientRg}</div>` : ""}
                    <div class="detail">Data: ${formatDate(new Date(data.prescriptionDate))}</div>
                </div>
                <table class="rx-table">
                    <thead>
                        <tr><th></th><th>Esférico</th><th>Cilíndrico</th><th>Eixo</th><th>DNP</th></tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>OD</strong></td>
                            <td>${formatValue(data.rightEyeSpherical)}</td>
                            <td>${formatValue(data.rightEyeCylindrical)}</td>
                            <td>${data.rightEyeAxis !== null ? data.rightEyeAxis + "°" : "-"}</td>
                            <td>${formatValue(data.dnpRight)}</td>
                        </tr>
                        <tr>
                            <td><strong>OE</strong></td>
                            <td>${formatValue(data.leftEyeSpherical)}</td>
                            <td>${formatValue(data.leftEyeCylindrical)}</td>
                            <td>${data.leftEyeAxis !== null ? data.leftEyeAxis + "°" : "-"}</td>
                            <td>${formatValue(data.dnpLeft)}</td>
                        </tr>
                    </tbody>
                </table>
                ${data.addition ? `<p style="margin-bottom:24px;font-size:14px;"><strong>Adição:</strong> ${data.addition}</p>` : ""}
                ${data.notes ? `<div class="notes"><h3>Observações</h3><p>${data.notes}</p></div>` : ""}
                ${data.prescribedBy ? `
                <div class="signature">
                    <div class="line"></div>
                    <p>${data.prescribedBy}</p>
                </div>` : ""}
                <div class="footer">
                    ${data.prescribedBy ? `<span>${data.prescribedBy}</span>` : ""}
                    <span>Emitido em ${formatDate(new Date())}</span>
                </div>
            </body>
            </html>
        `;

        printWindow.document.write(prescriptionHtml);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 300);
    }

    return (
        <>
            {/* Header */}
            <div className="flex flex-col gap-4 h-[128px] justify-center">
                <div className="flex justify-between items-center">
                    <div className="text-xl uppercase font-bold">Receitas</div>
                    <Badge variant="outline" className="text-xs">
                        Somente visualização
                    </Badge>
                </div>
                <div>
                    <Input
                        className="w-full md:max-w-md"
                        type="search"
                        placeholder="Buscar por paciente..."
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
            ) : prescriptions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    {debouncedSearch
                        ? "Nenhuma receita encontrada para essa busca."
                        : "Nenhuma receita disponível."}
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
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {prescriptions.map((rx) => (
                                    <TableRow key={rx.id}>
                                        <TableCell className="font-medium">
                                            {rx.patientName}
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell text-sm">
                                            <Badge variant="secondary" className="text-xs">
                                                <Store className="h-3 w-3 mr-1" />
                                                {rx.opticalShopName}
                                            </Badge>
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
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => handleViewDetail(rx.id)}
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

            {/* Detail dialog (read-only) */}
            <Dialog
                open={detailOpen}
                onOpenChange={(open) => {
                    setDetailOpen(open);
                    if (!open) setDetailData(null);
                }}
            >
                <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-between">
                            <span>Detalhes da Receita</span>
                            {detailData && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handlePrint}
                                    className="mr-6"
                                >
                                    <Printer className="h-4 w-4 mr-1" />
                                    Imprimir
                                </Button>
                            )}
                        </DialogTitle>
                    </DialogHeader>

                    {!detailData ? (
                        <div className="space-y-4 p-4">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-32 w-full" />
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {/* Patient info */}
                            <div className="space-y-1">
                                <h3 className="font-semibold text-lg">{detailData.patientName}</h3>
                                <div className="flex flex-wrap gap-2">
                                    {detailData.patientPhone && (
                                        <Badge variant="secondary">{detailData.patientPhone}</Badge>
                                    )}
                                    {detailData.patientCpf && (
                                        <Badge variant="secondary">CPF: {detailData.patientCpf}</Badge>
                                    )}
                                    {detailData.patientRg && (
                                        <Badge variant="secondary">RG: {detailData.patientRg}</Badge>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {detailData.opticalShopName} •{" "}
                                    {formatDate(new Date(detailData.prescriptionDate))}
                                </p>
                            </div>

                            <Separator />

                            {/* Prescription table */}
                            <div className="rounded-md border overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-muted/50">
                                            <th className="text-left p-2 font-medium"></th>
                                            <th className="p-2 font-medium text-center">Esférico</th>
                                            <th className="p-2 font-medium text-center">Cilíndrico</th>
                                            <th className="p-2 font-medium text-center">Eixo</th>
                                            <th className="p-2 font-medium text-center">DNP</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-t">
                                            <td className="p-2 font-semibold">OD</td>
                                            <td className="p-2 text-center">{formatValue(detailData.rightEyeSpherical)}</td>
                                            <td className="p-2 text-center">{formatValue(detailData.rightEyeCylindrical)}</td>
                                            <td className="p-2 text-center">
                                                {detailData.rightEyeAxis !== null ? `${detailData.rightEyeAxis}°` : "-"}
                                            </td>
                                            <td className="p-2 text-center">{formatValue(detailData.dnpRight)}</td>
                                        </tr>
                                        <tr className="border-t">
                                            <td className="p-2 font-semibold">OE</td>
                                            <td className="p-2 text-center">{formatValue(detailData.leftEyeSpherical)}</td>
                                            <td className="p-2 text-center">{formatValue(detailData.leftEyeCylindrical)}</td>
                                            <td className="p-2 text-center">
                                                {detailData.leftEyeAxis !== null ? `${detailData.leftEyeAxis}°` : "-"}
                                            </td>
                                            <td className="p-2 text-center">{formatValue(detailData.dnpLeft)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Extra fields */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                {detailData.addition && (
                                    <div>
                                        <span className="text-muted-foreground">Adição:</span>{" "}
                                        <span className="font-medium">{detailData.addition}</span>
                                    </div>
                                )}
                                {detailData.prescribedBy && (
                                    <div>
                                        <span className="text-muted-foreground">Prescrito por:</span>{" "}
                                        <span className="font-medium">{detailData.prescribedBy}</span>
                                    </div>
                                )}
                            </div>

                            {detailData.notes && (
                                <div className="text-sm">
                                    <span className="text-muted-foreground font-medium">
                                        Observações:
                                    </span>
                                    <p className="mt-1 whitespace-pre-wrap">{detailData.notes}</p>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
