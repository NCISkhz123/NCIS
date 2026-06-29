import { z } from "zod";

import { REUSABLE_STOCK_POSITIONS } from "@/lib/cssd/constants";

export const stockOpnameLineSchema = z.object({
  itemId: z.string().uuid("Item wajib dipilih"),
  stockPosition: z.enum(REUSABLE_STOCK_POSITIONS),
  hospitalUnitId: z.string().uuid().optional(),
  countedQuantity: z.coerce.number().int().min(0, "Jumlah tidak boleh negatif"),
  notes: z.string().trim().max(500).optional(),
});

export const stockOpnameSchema = z.object({
  opnameDate: z.coerce.date(),
  notes: z.string().trim().max(500).optional(),
  lines: z.array(stockOpnameLineSchema).min(1, "Minimal ada satu baris stok opname"),
});

export type StockOpnameValues = z.infer<typeof stockOpnameSchema>;
