"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
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
import { useDebounce } from "@/hooks/use-debounce";
import {
    ActionAutocompletePatients,
    ActionCreatePrescription,
    ActionCreatePrescriptionWithNewPatient,
} from "@/server/actions/admin/prescription.actions";
import { ActionGetProfile } from "@/server/actions/admin/profile.actions";
import { cn } from "@/lib/utils";
import { Check, Search, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DegreeCombobox } from "@/components/shared/degree-combobox/degree-combobox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// ── Degree option generators ──

function generateOptions(min: number, max: number, step: number): string[] {
    const options: string[] = [];
    // Use epsilon to avoid floating point issues
    for (let v = min; v <= max + 0.001; v += step) {
        const rounded = Math.round(v * 100) / 100;
        options.push(rounded >= 0 ? `+${rounded.toFixed(2)}` : rounded.toFixed(2));
    }
    return options;
}

const SPHERICAL_OPTIONS = generateOptions(-20, 20, 0.25);
const CYLINDRICAL_OPTIONS = generateOptions(-6, 0, 0.25);
const ADDITION_OPTIONS = generateOptions(0.25, 4, 0.25);
const AXIS_OPTIONS = Array.from({ length: 181 }, (_, i) => String(i));

/** Parse a diopter string like "+1.50" or "-2.25" to number */
function parseDiopter(value: string): number {
    if (!value || value === "") return 0;
    return parseFloat(value.replace(",", "."));
}

/** Format a number to diopter string like "+1.50" */
function formatDiopter(value: number): string {
    return value >= 0 ? `+${value.toFixed(2)}` : value.toFixed(2);
}

interface SheetCreatePrescriptionProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    opticalShopId: string;
    /** Pre-select a patient (from card dropdown "Criar Receita") */
    preSelectedPatient?: { id: string; fullName: string } | null;
}

interface AutocompletePatient {
    id: string;
    fullName: string;
    phone: string | null;
    cpf: string | null;
}

export function SheetCreatePrescription({
    open,
    onOpenChange,
    opticalShopId,
    preSelectedPatient,
}: SheetCreatePrescriptionProps) {
    const queryClient = useQueryClient();

    // ── Patient search state ──
    const [patientQuery, setPatientQuery] = useState("");
    const debouncedQuery = useDebounce(patientQuery, 300);
    const [suggestions, setSuggestions] = useState<AutocompletePatient[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<AutocompletePatient | null>(null);
    const [isNewPatient, setIsNewPatient] = useState(false);

    // ── New patient fields ──
    const [newPatientPhone, setNewPatientPhone] = useState("");
    const [newPatientCpf, setNewPatientCpf] = useState("");
    const [newPatientRg, setNewPatientRg] = useState("");
    const [newPatientDob, setNewPatientDob] = useState("");

    // ── Prescription fields (far vision) ──
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
    const [prescriptionDate, setPrescriptionDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [notes, setNotes] = useState("");
    const [privateNotes, setPrivateNotes] = useState("");

    // ── Near vision (auto-calculated) ──
    const odNearSpherical = useMemo(() => {
        if (!odSpherical || !addition) return "";
        const far = parseDiopter(odSpherical);
        const add = parseDiopter(addition);
        return formatDiopter(far + add);
    }, [odSpherical, addition]);

    const oeNearSpherical = useMemo(() => {
        if (!oeSpherical || !addition) return "";
        const far = parseDiopter(oeSpherical);
        const add = parseDiopter(addition);
        return formatDiopter(far + add);
    }, [oeSpherical, addition]);

    // ── Autocomplete action ──
    const autocompleteAction = useAction(ActionAutocompletePatients, {
        onSuccess: ({ data }) => {
            if (data) {
                setSuggestions(data);
                setShowSuggestions(true);
            }
        },
    });

    // ── Profile action (auto-fill optometrist name) ──
    const profileAction = useAction(ActionGetProfile, {
        onSuccess: ({ data }) => {
            if (data?.optometristName) {
                setPrescribedBy(data.optometristName);
            }
        },
    });

    // ── Create actions ──
    const createAction = useAction(ActionCreatePrescription, {
        onSuccess: () => {
            toast.success("Receita criada com sucesso!");
            queryClient.invalidateQueries({ queryKey: ["patients"] });
            queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
            resetAndClose();
        },
        onError: ({ error }) => {
            toast.error(error.serverError || "Erro ao criar receita.");
        },
    });

    const createWithNewPatientAction = useAction(ActionCreatePrescriptionWithNewPatient, {
        onSuccess: () => {
            toast.success("Paciente e receita criados com sucesso!");
            queryClient.invalidateQueries({ queryKey: ["patients"] });
            queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
            resetAndClose();
        },
        onError: ({ error }) => {
            toast.error(error.serverError || "Erro ao criar receita.");
        },
    });

    const isSubmitting = createAction.isPending || createWithNewPatientAction.isPending;

    // ── Effects ──
    useEffect(() => {
        if (debouncedQuery.length >= 2 && !selectedPatient) {
            autocompleteAction.execute({ query: debouncedQuery });
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [debouncedQuery]);

    useEffect(() => {
        if (preSelectedPatient && open) {
            setSelectedPatient({
                id: preSelectedPatient.id,
                fullName: preSelectedPatient.fullName,
                phone: null,
                cpf: null,
            });
            setPatientQuery(preSelectedPatient.fullName);
            setIsNewPatient(false);
        }
    }, [preSelectedPatient, open]);

    // Load optometrist name from profile when sheet opens
    useEffect(() => {
        if (open) {
            profileAction.execute();
        }
    }, [open]);

    // ── Handlers ──
    function resetAndClose() {
        setPatientQuery("");
        setSuggestions([]);
        setShowSuggestions(false);
        setSelectedPatient(null);
        setIsNewPatient(false);
        setNewPatientPhone("");
        setNewPatientCpf("");
        setNewPatientRg("");
        setNewPatientDob("");
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
        setPrescriptionDate(new Date().toISOString().split("T")[0]);
        setNotes("");
        setPrivateNotes("");
        onOpenChange(false);
    }

    function selectPatient(patient: AutocompletePatient) {
        setSelectedPatient(patient);
        setPatientQuery(patient.fullName);
        setShowSuggestions(false);
        setIsNewPatient(false);
    }

    function handleCreateNewPatient() {
        setIsNewPatient(true);
        setSelectedPatient(null);
        setShowSuggestions(false);
    }

    function clearPatientSelection() {
        setSelectedPatient(null);
        setIsNewPatient(false);
        setPatientQuery("");
        setSuggestions([]);
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const prescriptionData = {
            opticalShopId,
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
        };

        if (selectedPatient) {
            createAction.execute({
                ...prescriptionData,
                patientId: selectedPatient.id,
            });
        } else if (isNewPatient && patientQuery.trim().length >= 3) {
            // Convert DD/MM/YYYY to YYYY-MM-DD for the database
            let dobForDb: string | undefined;
            if (newPatientDob && newPatientDob.length === 10) {
                const [dd, mm, yyyy] = newPatientDob.split("/");
                dobForDb = `${yyyy}-${mm}-${dd}`;
            }
            createWithNewPatientAction.execute({
                ...prescriptionData,
                patientFullName: patientQuery.trim(),
                patientPhone: newPatientPhone || undefined,
                patientCpf: newPatientCpf || undefined,
                patientRg: newPatientRg || undefined,
                patientDateOfBirth: dobForDb,
            });
        } else {
            toast.error("Selecione ou cadastre um paciente.");
        }
    }

    const showPrescriptionForm = selectedPatient || isNewPatient;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="w-full sm:max-w-2xl overflow-y-auto"
            >
                <SheetHeader className="px-6">
                    <SheetTitle>Nova Receita</SheetTitle>
                    <SheetDescription>
                        Busque pelo paciente ou cadastre um novo.
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6 px-6 pb-6">
                    {/* ── Patient search ── */}
                    <div className="space-y-3">
                        <Label className="text-base font-semibold">Paciente</Label>

                        {selectedPatient ? (
                            <div className="flex items-center gap-2 rounded-md border p-3 bg-muted/50">
                                <Check className="h-4 w-4 text-green-600 shrink-0" />
                                <span className="font-medium flex-1 truncate">
                                    {selectedPatient.fullName}
                                </span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={clearPatientSelection}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        ) : (
                            <div className="relative">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        value={patientQuery}
                                        onChange={(e) => {
                                            setPatientQuery(e.target.value);
                                            if (isNewPatient && e.target.value.length < 2) {
                                                setIsNewPatient(false);
                                            }
                                        }}
                                        placeholder="Digite o nome do paciente..."
                                        className="pl-9"
                                        autoFocus
                                    />
                                </div>

                                {/* Suggestions dropdown */}
                                {showSuggestions && patientQuery.length >= 2 && (
                                    <div className="absolute z-50 w-full mt-1 rounded-md border bg-popover shadow-lg max-h-48 overflow-y-auto">
                                        {suggestions.length > 0 ? (
                                            suggestions.map((p) => (
                                                <button
                                                    key={p.id}
                                                    type="button"
                                                    className="w-full text-left px-3 py-2 hover:bg-accent text-sm transition-colors"
                                                    onClick={() => selectPatient(p)}
                                                >
                                                    <div className="font-medium">{p.fullName}</div>
                                                    {p.phone && (
                                                        <div className="text-xs text-muted-foreground">
                                                            {p.phone}
                                                        </div>
                                                    )}
                                                </button>
                                            ))
                                        ) : (
                                            <div className="px-3 py-2 text-sm text-muted-foreground">
                                                Nenhum paciente encontrado.
                                            </div>
                                        )}
                                        <Separator />
                                        <button
                                            type="button"
                                            className="w-full text-left px-3 py-2 hover:bg-accent text-sm font-medium text-primary flex items-center gap-2"
                                            onClick={handleCreateNewPatient}
                                        >
                                            <UserPlus className="h-4 w-4" />
                                            Cadastrar &quot;{patientQuery}&quot; como novo paciente
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── New patient fields ── */}
                    {isNewPatient && (
                        <div className="space-y-3 rounded-md border p-4 bg-muted/30">
                            <div className="flex items-center gap-2 mb-2">
                                <UserPlus className="h-4 w-4 text-primary" />
                                <span className="text-sm font-semibold">
                                    Novo paciente: {patientQuery}
                                </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="new-phone">Telefone</Label>
                                    <Input
                                        id="new-phone"
                                        value={newPatientPhone}
                                        onChange={(e) => setNewPatientPhone(e.target.value)}
                                        placeholder="(99) 99999-9999"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="new-cpf">CPF</Label>
                                    <Input
                                        id="new-cpf"
                                        value={newPatientCpf}
                                        onChange={(e) => setNewPatientCpf(e.target.value)}
                                        placeholder="000.000.000-00"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="new-rg">RG</Label>
                                    <Input
                                        id="new-rg"
                                        value={newPatientRg}
                                        onChange={(e) => setNewPatientRg(e.target.value)}
                                        placeholder="00.000.000-0"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="new-dob">Data de Nascimento</Label>
                                    <Input
                                        id="new-dob"
                                        inputMode="numeric"
                                        value={newPatientDob}
                                        onChange={(e) => {
                                            // Auto-format as DD/MM/YYYY
                                            let v = e.target.value.replace(/\D/g, "");
                                            if (v.length > 8) v = v.slice(0, 8);
                                            if (v.length > 4) {
                                                v = v.slice(0, 2) + "/" + v.slice(2, 4) + "/" + v.slice(4);
                                            } else if (v.length > 2) {
                                                v = v.slice(0, 2) + "/" + v.slice(2);
                                            }
                                            setNewPatientDob(v);
                                        }}
                                        placeholder="DD/MM/AAAA"
                                        maxLength={10}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Prescription form ── */}
                    {showPrescriptionForm && (
                        <>
                            <Separator />

                            <div className="space-y-4">
                                <Label className="text-base font-semibold">Longe (Prescrição)</Label>

                                {/* OD (Right Eye) - Far */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                                        Olho Direito (OD)
                                    </Label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="od-sph" className="text-xs">
                                                Esférico
                                            </Label>
                                            <DegreeCombobox
                                                id="od-sph"
                                                options={SPHERICAL_OPTIONS}
                                                value={odSpherical}
                                                onValueChange={setOdSpherical}
                                                placeholder="0.00"
                                                searchPlaceholder="Ex: -2.50"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="od-cyl" className="text-xs">
                                                Cilíndrico
                                            </Label>
                                            <DegreeCombobox
                                                id="od-cyl"
                                                options={CYLINDRICAL_OPTIONS}
                                                value={odCylindrical}
                                                onValueChange={setOdCylindrical}
                                                placeholder="0.00"
                                                searchPlaceholder="Ex: -1.00"
                                            />
                                        </div>
                                        <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                            <Label htmlFor="od-axis" className="text-xs">
                                                Eixo
                                            </Label>
                                            <DegreeCombobox
                                                id="od-axis"
                                                options={AXIS_OPTIONS}
                                                value={odAxis}
                                                onValueChange={setOdAxis}
                                                placeholder="0°"
                                                searchPlaceholder="Ex: 90"
                                                suffix="°"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* OE (Left Eye) - Far */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                                        Olho Esquerdo (OE)
                                    </Label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="oe-sph" className="text-xs">
                                                Esférico
                                            </Label>
                                            <DegreeCombobox
                                                id="oe-sph"
                                                options={SPHERICAL_OPTIONS}
                                                value={oeSpherical}
                                                onValueChange={setOeSpherical}
                                                placeholder="0.00"
                                                searchPlaceholder="Ex: -2.50"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="oe-cyl" className="text-xs">
                                                Cilíndrico
                                            </Label>
                                            <DegreeCombobox
                                                id="oe-cyl"
                                                options={CYLINDRICAL_OPTIONS}
                                                value={oeCylindrical}
                                                onValueChange={setOeCylindrical}
                                                placeholder="0.00"
                                                searchPlaceholder="Ex: -1.00"
                                            />
                                        </div>
                                        <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                            <Label htmlFor="oe-axis" className="text-xs">
                                                Eixo
                                            </Label>
                                            <DegreeCombobox
                                                id="oe-axis"
                                                options={AXIS_OPTIONS}
                                                value={oeAxis}
                                                onValueChange={setOeAxis}
                                                placeholder="0°"
                                                searchPlaceholder="Ex: 90"
                                                suffix="°"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Addition + DNP */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                        <Label htmlFor="addition" className="text-xs">
                                            Adição
                                        </Label>
                                        <Select value={addition} onValueChange={setAddition}>
                                            <SelectTrigger id="addition">
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
                                        <Label htmlFor="dnp-r" className="text-xs">
                                            DNP OD
                                        </Label>
                                        <Input
                                            id="dnp-r"
                                            value={dnpRight}
                                            onChange={(e) => setDnpRight(e.target.value)}
                                            placeholder="mm"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="dnp-l" className="text-xs">
                                            DNP OE
                                        </Label>
                                        <Input
                                            id="dnp-l"
                                            value={dnpLeft}
                                            onChange={(e) => setDnpLeft(e.target.value)}
                                            placeholder="mm"
                                        />
                                    </div>
                                </div>

                                {/* ── Near vision (auto-calculated) ── */}
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

                                {/* Date */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="date">Data da Receita</Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        value={prescriptionDate}
                                        onChange={(e) => setPrescriptionDate(e.target.value)}
                                    />
                                </div>

                                {/* Notes */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="notes">Observações</Label>
                                    <Textarea
                                        id="notes"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Observações gerais da receita..."
                                        rows={2}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="private-notes">Observações Privadas</Label>
                                    <Textarea
                                        id="private-notes"
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
                                    isLoading={isSubmitting}
                                    defaultText="Salvar Receita"
                                    loadingText="Salvando..."
                                />
                            </div>
                        </>
                    )}
                </form>
            </SheetContent>
        </Sheet>
    );
}
