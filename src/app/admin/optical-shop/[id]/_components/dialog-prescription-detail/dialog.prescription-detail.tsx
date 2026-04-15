"use client";

import { useEffect, useRef, useState } from "react";
import { useAction } from "next-safe-action/hooks";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ActionGetPrescriptionById } from "@/server/actions/admin/prescription.actions";
import { formatDate } from "@/lib/utils";
import { Printer } from "lucide-react";

interface DialogPrescriptionDetailProps {
    prescriptionId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
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
    privateNotes: string | null;
    prescribedBy: string | null;
    prescriptionDate: string;
    createdAt: Date;
}

function formatValue(v: string | number | null | undefined) {
    if (v === null || v === undefined || v === "") return "-";
    return String(v);
}

export function DialogPrescriptionDetail({
    prescriptionId,
    open,
    onOpenChange,
}: DialogPrescriptionDetailProps) {
    const [data, setData] = useState<PrescriptionDetail | null>(null);
    const printRef = useRef<HTMLDivElement>(null);

    const getAction = useAction(ActionGetPrescriptionById, {
        onSuccess: ({ data: result }) => {
            if (result) setData(result as PrescriptionDetail);
        },
    });

    useEffect(() => {
        if (prescriptionId && open) {
            setData(null);
            getAction.execute({ id: prescriptionId });
        }
    }, [prescriptionId, open]);

    function handlePrint() {
        if (!printRef.current || !data) return;

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
                    <h2>${data.patientName}</h2>
                    ${data.patientPhone ? `<div class="detail">Telefone: ${data.patientPhone}</div>` : ""}
                    ${data.patientCpf ? `<div class="detail">CPF: ${data.patientCpf}</div>` : ""}
                    ${data.patientRg ? `<div class="detail">RG: ${data.patientRg}</div>` : ""}
                    <div class="detail">Data: ${formatDate(data.prescriptionDate)}</div>
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
                </div>
                ` : ""}
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
        setTimeout(() => {
            printWindow.print();
        }, 300);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>Detalhes da Receita</span>
                        {data && (
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

                {!data ? (
                    <div className="space-y-4 p-4">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                ) : (
                    <div ref={printRef} className="space-y-5">
                        {/* Patient info */}
                        <div className="space-y-1">
                            <h3 className="font-semibold text-lg">{data.patientName}</h3>
                            <div className="flex flex-wrap gap-2">
                                {data.patientPhone && (
                                    <Badge variant="secondary">{data.patientPhone}</Badge>
                                )}
                                {data.patientCpf && (
                                    <Badge variant="secondary">CPF: {data.patientCpf}</Badge>
                                )}
                                {data.patientRg && (
                                    <Badge variant="secondary">RG: {data.patientRg}</Badge>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {data.opticalShopName} • {formatDate(data.prescriptionDate)}
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
                                        <td className="p-2 text-center">{formatValue(data.rightEyeSpherical)}</td>
                                        <td className="p-2 text-center">{formatValue(data.rightEyeCylindrical)}</td>
                                        <td className="p-2 text-center">
                                            {data.rightEyeAxis !== null ? `${data.rightEyeAxis}°` : "-"}
                                        </td>
                                        <td className="p-2 text-center">{formatValue(data.dnpRight)}</td>
                                    </tr>
                                    <tr className="border-t">
                                        <td className="p-2 font-semibold">OE</td>
                                        <td className="p-2 text-center">{formatValue(data.leftEyeSpherical)}</td>
                                        <td className="p-2 text-center">{formatValue(data.leftEyeCylindrical)}</td>
                                        <td className="p-2 text-center">
                                            {data.leftEyeAxis !== null ? `${data.leftEyeAxis}°` : "-"}
                                        </td>
                                        <td className="p-2 text-center">{formatValue(data.dnpLeft)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Extra fields */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            {data.addition && (
                                <div>
                                    <span className="text-muted-foreground">Adição:</span>{" "}
                                    <span className="font-medium">{data.addition}</span>
                                </div>
                            )}
                            {data.prescribedBy && (
                                <div>
                                    <span className="text-muted-foreground">Prescrito por:</span>{" "}
                                    <span className="font-medium">{data.prescribedBy}</span>
                                </div>
                            )}
                        </div>

                        {data.notes && (
                            <div className="text-sm">
                                <span className="text-muted-foreground font-medium">Observações:</span>
                                <p className="mt-1 whitespace-pre-wrap">{data.notes}</p>
                            </div>
                        )}

                        {data.privateNotes && (
                            <div className="text-sm rounded-md border border-dashed p-3 bg-muted/30">
                                <span className="text-muted-foreground font-medium">Observações Privadas:</span>
                                <p className="mt-1 whitespace-pre-wrap">{data.privateNotes}</p>
                            </div>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
