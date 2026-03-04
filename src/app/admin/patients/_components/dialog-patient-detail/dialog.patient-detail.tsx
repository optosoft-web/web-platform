"use client";

import { useEffect, useState } from "react";
import { useAction } from "next-safe-action/hooks";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getPatientDetails } from "@/server/actions/admin/patient.actions";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Printer, Store } from "lucide-react";

interface DialogPatientDetailProps {
    patientId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
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

function formatValue(v: string | number | null | undefined) {
    if (v === null || v === undefined || v === "") return "-";
    return String(v);
}

export function DialogPatientDetail({
    patientId,
    open,
    onOpenChange,
}: DialogPatientDetailProps) {
    const [data, setData] = useState<PatientDetail | null>(null);

    function handlePrintRx(rx: PatientDetail["prescriptions"][number]) {
        const printWindow = window.open("", "_blank", "width=800,height=600");
        if (!printWindow) return;

        const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Receita - ${data?.fullName ?? ""}</title>
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
        <h1>Receita Oftalmológica</h1>
    </div>
    <div class="patient-info">
        <h2>${data?.fullName ?? ""}</h2>
        ${data?.phone ? `<div class="detail">Telefone: ${data.phone}</div>` : ""}
        ${data?.cpf ? `<div class="detail">CPF: ${data.cpf}</div>` : ""}
        ${data?.rg ? `<div class="detail">RG: ${data.rg}</div>` : ""}
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

    const getAction = useAction(getPatientDetails, {
        onSuccess: ({ data: result }) => {
            if (result) setData(result as unknown as PatientDetail);
        },
    });

    useEffect(() => {
        if (patientId && open) {
            setData(null);
            getAction.execute({ id: patientId });
        }
    }, [patientId, open]);

    const isLoading = getAction.isPending;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isLoading ? (
                            <Skeleton className="h-6 w-48" />
                        ) : (
                            data?.fullName ?? "Detalhes do Paciente"
                        )}
                    </DialogTitle>
                </DialogHeader>

                {isLoading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                ) : data ? (
                    <div className="space-y-5">
                        {/* Patient info */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            {data.phone && (
                                <div>
                                    <span className="text-muted-foreground">Telefone:</span>{" "}
                                    <span className="font-medium">{data.phone}</span>
                                </div>
                            )}
                            {data.cpf && (
                                <div>
                                    <span className="text-muted-foreground">CPF:</span>{" "}
                                    <span className="font-medium">{data.cpf}</span>
                                </div>
                            )}
                            {data.rg && (
                                <div>
                                    <span className="text-muted-foreground">RG:</span>{" "}
                                    <span className="font-medium">{data.rg}</span>
                                </div>
                            )}
                            {data.dateOfBirth && (
                                <div>
                                    <span className="text-muted-foreground">Nascimento:</span>{" "}
                                    <span className="font-medium">
                                        {formatDate(new Date(data.dateOfBirth))}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Optical shops */}
                        {data.patientOpticalShops.length > 0 && (
                            <div className="space-y-2">
                                <span className="text-sm text-muted-foreground font-medium">
                                    Óticas vinculadas
                                </span>
                                <div className="flex flex-wrap gap-2">
                                    {data.patientOpticalShops.map((pos) => (
                                        <Link
                                            key={pos.opticalShop.id}
                                            href={`/admin/optical-shop/${pos.opticalShop.id}`}
                                        >
                                            <Badge
                                                variant="secondary"
                                                className="cursor-pointer hover:bg-secondary/80"
                                            >
                                                <Store className="h-3 w-3 mr-1" />
                                                {pos.opticalShop.name}
                                            </Badge>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        <Separator />

                        {/* Prescriptions history */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold">
                                Histórico de Receitas ({data.prescriptions.length})
                            </h3>

                            {data.prescriptions.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    Nenhuma receita registrada.
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {data.prescriptions.map((rx) => (
                                        <div
                                            key={rx.id}
                                            className="rounded-md border overflow-hidden text-sm"
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
    );
}
