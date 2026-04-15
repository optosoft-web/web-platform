"use client";

import { useState, useEffect, useMemo } from "react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { LoadingButton } from "@/components/shared/loading-button/loading-button";
import {
    ActionGetPrescriptionById,
    ActionUpdatePrescription,
} from "@/server/actions/admin/prescription.actions";
import { DegreeCombobox } from "@/components/shared/degree-combobox/degree-combobox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

// ── Degree option generators ──

function generateOptions(min: number, max: number, step: number): string[] {
    const options: string[] = [];
    for (let v = min; v <= max + 0.001; v += step) {
        const rounded = Math.round(v * 100) / 100;
        options.push(rounded >= 0 ? `+${rounded.toFixed(2)}` : rounded.toFixed(2));
    }
    return options;
}

const SPHERICAL_OPTIONS = generateOptions(-20, 20, 0.25);
const CYLINDRICAL_OPTIONS = generateOptions(-6, 0, 0.25);
const ADDITION_OPTIONS = generateOptions(0.25, 4, 0.25);

function parseDiopter(value: string): number {
    if (!value || value === "") return 0;
    return parseFloat(value.replace(",", "."));
}

function formatDiopter(value: number): string {
    return value >= 0 ? `+${value.toFixed(2)}` : value.toFixed(2);
}

interface SheetEditPrescriptionProps {
    prescriptionId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SheetEditPrescription({
    prescriptionId,
    open,
    onOpenChange,
}: SheetEditPrescriptionProps) {
    const queryClient = useQueryClient();

    // ── Form fields ──
    const [odSpherical, setOdSpherical] = useState("");
    const [odCylindrical, setOdCylindrical] = useState("");
    const [odAxis, setOdAxis] = useState("");
    const [oeSpherical, setOeSpherical] = useState("");
    const [oeCylindrical, setOeCylindrical] = useState("");
    const [oeAxis, setOeAxis] = useState("");
    const [addition, setAddition] = useState("");
    const [dnpRight, setDnpRight] = useState("");
    const [dnpLeft, setDnpLeft] = useState("");
    const [prescribedBy, setPrescribedBy] = useState("");
    const [prescriptionDate, setPrescriptionDate] = useState("");
    const [notes, setNotes] = useState("");
    const [privateNotes, setPrivateNotes] = useState("");
    const [patientName, setPatientName] = useState("");
    const [isLoaded, setIsLoaded] = useState(false);

    // ── Near vision (auto-calculated) ──
    const odNearSpherical = useMemo(() => {
        if (!odSpherical || !addition || addition === "__none") return "";
        const far = parseDiopter(odSpherical);
        const add = parseDiopter(addition);
        return formatDiopter(far + add);
    }, [odSpherical, addition]);

    const oeNearSpherical = useMemo(() => {
        if (!oeSpherical || !addition || addition === "__none") return "";
        const far = parseDiopter(oeSpherical);
        const add = parseDiopter(addition);
        return formatDiopter(far + add);
    }, [oeSpherical, addition]);

    // ── Fetch prescription data ──
    const getAction = useAction(ActionGetPrescriptionById, {
        onSuccess: ({ data }) => {
            if (data) {
                setPatientName(data.patientName);
                setOdSpherical(data.rightEyeSpherical || "");
                setOdCylindrical(data.rightEyeCylindrical || "");
                setOdAxis(data.rightEyeAxis != null ? String(data.rightEyeAxis) : "");
                setOeSpherical(data.leftEyeSpherical || "");
                setOeCylindrical(data.leftEyeCylindrical || "");
                setOeAxis(data.leftEyeAxis != null ? String(data.leftEyeAxis) : "");
                setAddition(data.addition || "");
                setDnpRight(data.dnpRight || "");
                setDnpLeft(data.dnpLeft || "");
                setPrescribedBy(data.prescribedBy || "");
                setPrescriptionDate(data.prescriptionDate || "");
                setNotes(data.notes || "");
                setPrivateNotes(data.privateNotes || "");
                setIsLoaded(true);
            }
        },
        onError: () => {
            toast.error("Erro ao buscar dados da receita.");
        },
    });

    // ── Update action ──
    const updateAction = useAction(ActionUpdatePrescription, {
        onSuccess: () => {
            toast.success("Receita atualizada com sucesso!");
            queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
            onOpenChange(false);
        },
        onError: ({ error }) => {
            toast.error(error.serverError || "Erro ao atualizar receita.");
        },
    });

    // ── Load data when opened ──
    useEffect(() => {
        if (prescriptionId && open) {
            setIsLoaded(false);
            getAction.execute({ id: prescriptionId });
        }
    }, [prescriptionId, open]);

    // ── Reset when closed ──
    useEffect(() => {
        if (!open) {
            setIsLoaded(false);
            setPatientName("");
            setOdSpherical("");
            setOdCylindrical("");
            setOdAxis("");
            setOeSpherical("");
            setOeCylindrical("");
            setOeAxis("");
            setAddition("");
            setDnpRight("");
            setDnpLeft("");
            setPrescribedBy("");
            setPrescriptionDate("");
            setNotes("");
            setPrivateNotes("");
        }
    }, [open]);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!prescriptionId) return;

        updateAction.execute({
            id: prescriptionId,
            rightEyeSpherical: odSpherical || undefined,
            rightEyeCylindrical: odCylindrical || undefined,
            rightEyeAxis: odAxis ? parseInt(odAxis) : undefined,
            leftEyeSpherical: oeSpherical || undefined,
            leftEyeCylindrical: oeCylindrical || undefined,
            leftEyeAxis: oeAxis ? parseInt(oeAxis) : undefined,
            addition: addition && addition !== "__none" ? addition : undefined,
            dnpRight: dnpRight || undefined,
            dnpLeft: dnpLeft || undefined,
            notes: notes || undefined,
            privateNotes: privateNotes || undefined,
            prescribedBy: prescribedBy || undefined,
            prescriptionDate: prescriptionDate || undefined,
        });
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="w-full sm:max-w-2xl overflow-y-auto"
            >
                <SheetHeader className="px-6">
                    <SheetTitle>Editar Receita</SheetTitle>
                    <SheetDescription>
                        {patientName
                            ? `Editando receita de ${patientName}`
                            : "Carregando..."}
                    </SheetDescription>
                </SheetHeader>

                {!isLoaded ? (
                    <div className="space-y-4 px-6">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6 px-6 pb-6">
                        <Separator />

                        <div className="space-y-4">
                            <Label className="text-base font-semibold">Longe (Prescrição)</Label>

                            {/* OD (Right Eye) */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                                    Olho Direito (OD)
                                </Label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="edit-od-sph" className="text-xs">
                                            Esférico
                                        </Label>
                                        <DegreeCombobox
                                            id="edit-od-sph"
                                            options={SPHERICAL_OPTIONS}
                                            value={odSpherical}
                                            onValueChange={setOdSpherical}
                                            placeholder="0.00"
                                            searchPlaceholder="Ex: -2.50"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="edit-od-cyl" className="text-xs">
                                            Cilíndrico
                                        </Label>
                                        <DegreeCombobox
                                            id="edit-od-cyl"
                                            options={CYLINDRICAL_OPTIONS}
                                            value={odCylindrical}
                                            onValueChange={setOdCylindrical}
                                            placeholder="0.00"
                                            searchPlaceholder="Ex: -1.00"
                                        />
                                    </div>
                                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                        <Label htmlFor="edit-od-axis" className="text-xs">
                                            Eixo
                                        </Label>
                                        <Input
                                            id="edit-od-axis"
                                            type="number"
                                            min={0}
                                            max={180}
                                            value={odAxis}
                                            onChange={(e) => setOdAxis(e.target.value)}
                                            placeholder="0°"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* OE (Left Eye) */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                                    Olho Esquerdo (OE)
                                </Label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="edit-oe-sph" className="text-xs">
                                            Esférico
                                        </Label>
                                        <DegreeCombobox
                                            id="edit-oe-sph"
                                            options={SPHERICAL_OPTIONS}
                                            value={oeSpherical}
                                            onValueChange={setOeSpherical}
                                            placeholder="0.00"
                                            searchPlaceholder="Ex: -2.50"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="edit-oe-cyl" className="text-xs">
                                            Cilíndrico
                                        </Label>
                                        <DegreeCombobox
                                            id="edit-oe-cyl"
                                            options={CYLINDRICAL_OPTIONS}
                                            value={oeCylindrical}
                                            onValueChange={setOeCylindrical}
                                            placeholder="0.00"
                                            searchPlaceholder="Ex: -1.00"
                                        />
                                    </div>
                                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                        <Label htmlFor="edit-oe-axis" className="text-xs">
                                            Eixo
                                        </Label>
                                        <Input
                                            id="edit-oe-axis"
                                            type="number"
                                            min={0}
                                            max={180}
                                            value={oeAxis}
                                            onChange={(e) => setOeAxis(e.target.value)}
                                            placeholder="0°"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Addition + DNP */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                    <Label htmlFor="edit-addition" className="text-xs">
                                        Adição
                                    </Label>
                                    <Select value={addition} onValueChange={setAddition}>
                                        <SelectTrigger id="edit-addition">
                                            <SelectValue placeholder="0.00" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="__none">Sem adição</SelectItem>
                                            {ADDITION_OPTIONS.map((opt) => (
                                                <SelectItem key={opt} value={opt}>
                                                    {opt}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="edit-dnp-r" className="text-xs">
                                        DNP OD
                                    </Label>
                                    <Input
                                        id="edit-dnp-r"
                                        value={dnpRight}
                                        onChange={(e) => setDnpRight(e.target.value)}
                                        placeholder="mm"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="edit-dnp-l" className="text-xs">
                                        DNP OE
                                    </Label>
                                    <Input
                                        id="edit-dnp-l"
                                        value={dnpLeft}
                                        onChange={(e) => setDnpLeft(e.target.value)}
                                        placeholder="mm"
                                    />
                                </div>
                            </div>

                            {/* Near vision (auto-calculated) */}
                            {addition && addition !== "__none" && (odSpherical || oeSpherical) && (
                                <>
                                    <Separator />
                                    <Label className="text-base font-semibold">Perto (Calculado)</Label>
                                    <div className="rounded-md border p-4 bg-muted/30 space-y-3">
                                        {odSpherical && (
                                            <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                                                <span className="text-sm font-medium w-8">OD:</span>
                                                <span className="text-sm">
                                                    Esférico: <strong>{odNearSpherical}</strong>
                                                </span>
                                                {odCylindrical && (
                                                    <span className="text-sm">
                                                        Cilíndrico: <strong>{odCylindrical}</strong>
                                                    </span>
                                                )}
                                                {odAxis && (
                                                    <span className="text-sm">
                                                        Eixo: <strong>{odAxis}°</strong>
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                        {oeSpherical && (
                                            <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                                                <span className="text-sm font-medium w-8">OE:</span>
                                                <span className="text-sm">
                                                    Esférico: <strong>{oeNearSpherical}</strong>
                                                </span>
                                                {oeCylindrical && (
                                                    <span className="text-sm">
                                                        Cilíndrico: <strong>{oeCylindrical}</strong>
                                                    </span>
                                                )}
                                                {oeAxis && (
                                                    <span className="text-sm">
                                                        Eixo: <strong>{oeAxis}°</strong>
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                        <p className="text-xs text-muted-foreground">
                                            Grau de perto = esférico de longe + adição. Cilíndrico e eixo permanecem iguais.
                                        </p>
                                    </div>
                                </>
                            )}

                            {/* Prescribed By */}
                            <div className="space-y-1.5">
                                <Label htmlFor="edit-prescribed-by">Prescrito por</Label>
                                <Input
                                    id="edit-prescribed-by"
                                    value={prescribedBy}
                                    onChange={(e) => setPrescribedBy(e.target.value)}
                                    placeholder="Nome do optometrista"
                                />
                            </div>

                            {/* Date */}
                            <div className="space-y-1.5">
                                <Label htmlFor="edit-date">Data da Receita</Label>
                                <Input
                                    id="edit-date"
                                    type="date"
                                    value={prescriptionDate}
                                    onChange={(e) => setPrescriptionDate(e.target.value)}
                                />
                            </div>

                            {/* Notes */}
                            <div className="space-y-1.5">
                                <Label htmlFor="edit-notes">Observações</Label>
                                <Textarea
                                    id="edit-notes"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Observações gerais da receita..."
                                    rows={2}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="edit-private-notes">Observações Privadas</Label>
                                <Textarea
                                    id="edit-private-notes"
                                    value={privateNotes}
                                    onChange={(e) => setPrivateNotes(e.target.value)}
                                    placeholder="Observações internas (não aparecem na impressão)..."
                                    rows={2}
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <LoadingButton
                                type="submit"
                                className="w-full"
                                isLoading={updateAction.isPending}
                                defaultText="Salvar Alterações"
                                loadingText="Salvando..."
                            />
                        </div>
                    </form>
                )}
            </SheetContent>
        </Sheet>
    );
}
