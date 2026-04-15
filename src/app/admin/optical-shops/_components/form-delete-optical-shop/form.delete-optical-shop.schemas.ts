import z from "zod";

export const FormDeleteOpticalShopSchema = z.object({
    id: z.string().min(2),
});