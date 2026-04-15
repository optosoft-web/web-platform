"use client";

import type { Prescription } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";

interface PrescriptionTableProps {
  prescriptions: Prescription[];
  onEdit: (prescription: Prescription) => void;
  onDelete: (id: string) => void;
}

function formatNum(val: number | null | undefined): string {
  const n = val ?? 0;
  if (n === 0) return "0.00";
  return n > 0 ? `+${n.toFixed(2)}` : n.toFixed(2);
}

function formatEixo(val: number | null | undefined): string {
  return `${val ?? 0}°`;
}

function formatAdicao(val: number | null | undefined): string {
  const n = val ?? 0;
  if (n === 0) return "0.00";
  return `+${n.toFixed(2)}`;
}

export function PrescriptionTable({
  prescriptions,
  onEdit,
  onDelete,
}: PrescriptionTableProps) {
  if (prescriptions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Nenhuma receita cadastrada. Clique em &quot;Nova Receita&quot; para
        começar.
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Paciente</TableHead>
            <TableHead>Data</TableHead>
            <TableHead className="text-center" colSpan={4}>
              Olho Direito (OD)
            </TableHead>
            <TableHead className="text-center" colSpan={4}>
              Olho Esquerdo (OE)
            </TableHead>
            <TableHead>DNP</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
          <TableRow>
            <TableHead />
            <TableHead />
            <TableHead className="text-xs">Esf</TableHead>
            <TableHead className="text-xs">Cil</TableHead>
            <TableHead className="text-xs">Eixo</TableHead>
            <TableHead className="text-xs">Ad</TableHead>
            <TableHead className="text-xs">Esf</TableHead>
            <TableHead className="text-xs">Cil</TableHead>
            <TableHead className="text-xs">Eixo</TableHead>
            <TableHead className="text-xs">Ad</TableHead>
            <TableHead className="text-xs">OD / OE</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {prescriptions.map((rx) => (
            <TableRow key={rx.id}>
              <TableCell className="font-medium">{rx.patientName}</TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {new Date(rx.date + "T00:00:00").toLocaleDateString("pt-BR")}
                </Badge>
              </TableCell>
              {/* OD */}
              <TableCell className="tabular-nums">
                {formatNum(rx.odEsferico)}
              </TableCell>
              <TableCell className="tabular-nums">
                {formatNum(rx.odCilindrico)}
              </TableCell>
              <TableCell className="tabular-nums">
                {formatEixo(rx.odEixo)}
              </TableCell>
              <TableCell className="tabular-nums">
                {formatAdicao(rx.odAdicao)}
              </TableCell>
              {/* OE */}
              <TableCell className="tabular-nums">
                {formatNum(rx.oeEsferico)}
              </TableCell>
              <TableCell className="tabular-nums">
                {formatNum(rx.oeCilindrico)}
              </TableCell>
              <TableCell className="tabular-nums">
                {formatEixo(rx.oeEixo)}
              </TableCell>
              <TableCell className="tabular-nums">
                {formatAdicao(rx.oeAdicao)}
              </TableCell>
              {/* DNP */}
              <TableCell className="tabular-nums">
                {rx.dnpOd} / {rx.dnpOe}
              </TableCell>
              {/* Ações */}
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(rx)}
                    title="Editar receita"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(rx.id)}
                    title="Excluir receita"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
