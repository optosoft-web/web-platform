export interface Prescription {
  id: string;
  patientName: string;
  date: string;
  optometrist: string;

  // Olho Direito (OD)
  odEsferico: number;
  odCilindrico: number;
  odEixo: number; // 0 a 180
  odAdicao: number; // 0 quando null/undefined

  // Olho Esquerdo (OE)
  oeEsferico: number;
  oeCilindrico: number;
  oeEixo: number; // 0 a 180
  oeAdicao: number; // 0 quando null/undefined

  dnpOd: number;
  dnpOe: number;

  observacoes: string;
}

export type PrescriptionFormData = Omit<Prescription, "id">;
