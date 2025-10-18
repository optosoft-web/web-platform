"use client"

import { patientTable } from "@/server/database/tables"
import { ColumnDef } from "@tanstack/react-table"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want

export type iPatient = typeof patientTable.$inferSelect;

export const tablePatientColumns: ColumnDef<iPatient>[] = [
    {
        accessorKey: "fullName",
        header: "Paciente",
    },
    {
        accessorKey: "dateOfBirth",
        header: "Data de nascimento",
    },
    {
        accessorKey: "contactInfo",
        header: "Contato",
    },
    {
        accessorKey: "createdAt",
        header: 'Criado em'
    }
]