import { z } from "zod";

export const uomFormSchema = z.object({
  code: z.string().trim().min(1, "Kode satuan wajib diisi").max(30),
  name: z.string().trim().min(1, "Nama satuan wajib diisi").max(100),
  isActive: z.boolean().optional().default(true),
});

export type UomFormValues = z.infer<typeof uomFormSchema>;
