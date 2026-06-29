import { z } from "zod";

import { ITEM_TYPES } from "@/lib/cssd/constants";

const itemCodePattern = /^[A-Z0-9-]+$/;

export const itemFormSchema = z.object({
  code: z
    .string()
    .trim()
    .max(50, "Kode item maksimal 50 karakter")
    .refine((value) => value === "" || itemCodePattern.test(value), {
      message: "Kode item hanya boleh berisi huruf besar, angka, dan tanda hubung",
    }),
  itemType: z.enum(ITEM_TYPES),
  name: z.string().trim().min(1, "Nama item wajib diisi").max(150),
  uomId: z.string().uuid("Satuan wajib dipilih"),
  isActive: z.boolean().optional().default(true),
  notes: z.string().trim().max(500).optional(),
});

export type ItemFormValues = z.infer<typeof itemFormSchema>;
