"use client";

import { useCallback, useState } from "react";
import type { Prescription, PrescriptionFormData } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const EMPTY_FORM: PrescriptionFormData = {
  patientName: "",
  date: new Date().toISOString().slice(0, 10),
  optometrist: "",
  odEsferico: 0,
  odCilindrico: 0,
  odEixo: 0,
  odAdicao: 0,
  oeEsferico: 0,
  oeCilindrico: 0,
  oeEixo: 0,
  oeAdicao: 0,
  dnpOd: 0,
  dnpOe: 0,
  observacoes: "",
};

interface PrescriptionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: PrescriptionFormData) => void;
  initial?: Prescription | null;
}

export function PrescriptionForm({
  open,
  onOpenChange,
  onSave,
  initial,
}: PrescriptionFormProps) {
  const [form, setForm] = useState<PrescriptionFormData>(
    initial ?? { ...EMPTY_FORM }
  );

  const resetForm = useCallback(
    (next?: Prescription | null) => {
      setForm(
        next
          ? {
              patientName: next.patientName,
              date: next.date,
              optometrist: next.optometrist,
              odEsferico: next.odEsferico,
              odCilindrico: next.odCilindrico,
              odEixo: next.odEixo,
              odAdicao: next.odAdicao ?? 0,
              oeEsferico: next.oeEsferico,
              oeCilindrico: next.oeCilindrico,
              oeEixo: next.oeEixo,
              oeAdicao: next.oeAdicao ?? 0,
              dnpOd: next.dnpOd,
              dnpOe: next.dnpOe,
              observacoes: next.observacoes,
            }
          : { ...EMPTY_FORM, date: new Date().toISOString().slice(0, 10) }
      );
    },
    []
  );

  // Sync form whenever initial changes or dialog opens
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      resetForm(initial);
    }
    onOpenChange(isOpen);
  };

  const setField = <K extends keyof PrescriptionFormData>(
    key: K,
    value: PrescriptionFormData[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const numChange = (key: keyof PrescriptionFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const raw = e.target.value;
    setField(key, raw === "" ? (0 as never) : (parseFloat(raw) as never));
  };

  const eixoChange = (key: "odEixo" | "oeEixo") => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val)) {
      setField(key, 0);
    } else {
      setField(key, Math.min(180, Math.max(0, val)));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...form,
      odAdicao: form.odAdicao ?? 0,
      oeAdicao: form.oeAdicao ?? 0,
    });
    onOpenChange(false);
  };

  const isEditing = !!initial;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Receita" : "Nova Receita"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados gerais */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="patientName">Paciente</Label>
              <Input
                id="patientName"
                required
                value={form.patientName}
                onChange={(e) => setField("patientName", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="optometrist">Optometrista</Label>
              <Input
                id="optometrist"
                required
                value={form.optometrist}
                onChange={(e) => setField("optometrist", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                required
                value={form.date}
                onChange={(e) => setField("date", e.target.value)}
              />
            </div>
          </div>

          <Separator />

          {/* Olho Direito */}
          <div>
            <h3 className="font-semibold mb-3">Olho Direito (OD)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="odEsferico">Esférico</Label>
                <Input
                  id="odEsferico"
                  type="number"
                  step="0.25"
                  value={form.odEsferico}
                  onChange={numChange("odEsferico")}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="odCilindrico">Cilíndrico</Label>
                <Input
                  id="odCilindrico"
                  type="number"
                  step="0.25"
                  value={form.odCilindrico}
                  onChange={numChange("odCilindrico")}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="odEixo">Eixo (0–180)</Label>
                <Input
                  id="odEixo"
                  type="number"
                  min={0}
                  max={180}
                  step={1}
                  value={form.odEixo}
                  onChange={eixoChange("odEixo")}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="odAdicao">Adição</Label>
                <Input
                  id="odAdicao"
                  type="number"
                  step="0.25"
                  value={form.odAdicao}
                  onChange={numChange("odAdicao")}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Olho Esquerdo */}
          <div>
            <h3 className="font-semibold mb-3">Olho Esquerdo (OE)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="oeEsferico">Esférico</Label>
                <Input
                  id="oeEsferico"
                  type="number"
                  step="0.25"
                  value={form.oeEsferico}
                  onChange={numChange("oeEsferico")}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="oeCilindrico">Cilíndrico</Label>
                <Input
                  id="oeCilindrico"
                  type="number"
                  step="0.25"
                  value={form.oeCilindrico}
                  onChange={numChange("oeCilindrico")}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="oeEixo">Eixo (0–180)</Label>
                <Input
                  id="oeEixo"
                  type="number"
                  min={0}
                  max={180}
                  step={1}
                  value={form.oeEixo}
                  onChange={eixoChange("oeEixo")}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="oeAdicao">Adição</Label>
                <Input
                  id="oeAdicao"
                  type="number"
                  step="0.25"
                  value={form.oeAdicao}
                  onChange={numChange("oeAdicao")}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* DNP + Observações */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="dnpOd">DNP OD (mm)</Label>
              <Input
                id="dnpOd"
                type="number"
                step="0.5"
                value={form.dnpOd}
                onChange={numChange("dnpOd")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dnpOe">DNP OE (mm)</Label>
              <Input
                id="dnpOe"
                type="number"
                step="0.5"
                value={form.dnpOe}
                onChange={numChange("dnpOe")}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="observacoes">Observações</Label>
            <textarea
              id="observacoes"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={form.observacoes}
              onChange={(e) => setField("observacoes", e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {isEditing ? "Salvar Alterações" : "Criar Receita"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
