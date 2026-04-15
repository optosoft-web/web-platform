import z from "zod";

export const FormEditOpticalShopSchema = z.object({
    id: z.string().min(2),
    name: z.string().min(2, "O nome da ótica é obrigatório."),
    address: z.string().optional()
});