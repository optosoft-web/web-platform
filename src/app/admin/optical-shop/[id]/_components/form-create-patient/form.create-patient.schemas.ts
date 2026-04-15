import { z } from "zod";

export const createPatientFormSchema = z.object({
    fullName: z.string().min(3, "O nome completo é obrigatório (mínimo 3 caracteres)."),
    phone: z.string().optional(),
    cpf: z.string().optional(),
    rg: z.string().optional(),
    dateOfBirth: z.string().optional(),
    contactInfo: z.string().optional(),
});

export type CreatePatientFormValues = z.infer<typeof createPatientFormSchema>;
