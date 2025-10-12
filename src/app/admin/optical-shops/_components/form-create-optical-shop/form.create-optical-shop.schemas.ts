import z from "zod";

export const FormCreateOpticalShopSchema = z.object({
    name: z.string().min(2, "O nome da ótica é obrigatório."),
    address: z.string().optional()
});