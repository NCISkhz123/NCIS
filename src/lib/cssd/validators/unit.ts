import { z } from "zod";

export const unitFormSchema = z.object({
  code: z.string().trim().min(1, "Kode unit wajib diisi").max(30),
  name: z.string().trim().min(1, "Nama unit wajib diisi").max(120),
  isActive: z.boolean().optional().default(true),
});

export type UnitFormValues = z.infer<typeof unitFormSchema>;
