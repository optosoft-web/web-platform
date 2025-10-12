"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PatientSearch } from "./patient-search";
import { NewPrescriptionForm } from "./forms/new-prescription-form";
import { useQuery } from "@tanstack/react-query";
import { getPatientDetails } from "@/server/actions/admin/patient.actions";
import { CreatePatientForm } from "./forms/create-patient-form";

interface FullPatient {
  id: string;
  fullName: string;
  dateOfBirth?: string | null;
  contactInfo?: string | null;
}

export function PrescriptionFlow() {
  const [mode, setMode] = useState<"search" | "create">("search");
  const [selectedPatient, setSelectedPatient] = useState<FullPatient | null>(null);
  const [newPatientName, setNewPatientName] = useState("");

  const handlePatientSelect = (patient: FullPatient | null) => {
    setSelectedPatient(patient);
    if (patient) {
      setMode("search"); 
      console.log("Paciente selecionado:", patient.id);

    }
  };

  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const { data: patientDetails, isLoading } = useQuery({
    queryKey: ['patientDetails', selectedPatientId],
    queryFn: () => getPatientDetails({ id: selectedPatientId! }),
    enabled: !!selectedPatientId,
  });

  const handleNewPatientRequest = (name: string) => {
    setMode("create");
    setNewPatientName(name);
    setSelectedPatient(null);
  };

  const handlePatientCreated = (patient: FullPatient) => {
    setSelectedPatient(patient);
    setMode("search");
  };


  const patientForForm = selectedPatient ? [selectedPatient] : [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>1. Identificação do Paciente</CardTitle>
          <CardDescription>
            Busque por um paciente existente ou cadastre um novo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PatientSearch
            selectedPatient={selectedPatient}
            onPatientSelect={handlePatientSelect}
            onNewPatientRequest={handleNewPatientRequest}
          />
        </CardContent>
      </Card>

      {mode === "create" && (
        <Card className="animate-in fade-in-50">
          <CardHeader>
            <CardTitle>Cadastrar Novo Paciente</CardTitle>
          </CardHeader>
          <CardContent>
            <CreatePatientForm
              initialName={newPatientName}
              onPatientCreated={handlePatientCreated}
            />
          </CardContent>
        </Card>
      )}

      {selectedPatient && (
        <div className="animate-in fade-in-50">
          <Card className="mb-6">
            <CardHeader><CardTitle>Histórico de Prescrições</CardTitle></CardHeader>
            <CardContent>
              <p className="text-muted-foreground">(A lista de prescrições antigas do paciente apareceria aqui)</p>
            </CardContent>
          </Card>

          <NewPrescriptionForm patients={patientForForm} />
        </div>
      )}
    </div>
  );
}