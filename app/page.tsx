
"use client";

import { useState } from "react";
import type { Prescription, PrescriptionFormData } from "@/lib/types";
import { usePrescriptions } from "@/lib/use-prescriptions";
import { PrescriptionForm } from "@/components/prescription-form";
import { PrescriptionTable } from "@/components/prescription-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Home() {
  const { prescriptions, loaded, create, update, remove } = usePrescriptions();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Prescription | null>(null);

  const handleNew = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEdit = (rx: Prescription) => {
    setEditing(rx);
    setFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta receita?")) {
      remove(id);
    }
  };

  const handleSave = (data: PrescriptionFormData) => {
    if (editing) {
      update(editing.id, data);
    } else {
      create(data);
    }
    setEditing(null);
  };

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Carregando…
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Receitas</h1>
          <p className="text-muted-foreground text-sm">
            Gerencie as receitas ópticas dos pacientes
          </p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Receita
        </Button>
      </div>

      <PrescriptionTable
        prescriptions={prescriptions}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <PrescriptionForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSave={handleSave}
        initial={editing}
      />
    </div>
  );
}
