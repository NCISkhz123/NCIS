import { z } from "zod";

import { ITEM_TYPES } from "@/lib/cssd/constants";

export const distributionSchema = z
  .object({
    itemId: z.string().uuid("Item wajib dipilih"),
    itemType: z.enum(ITEM_TYPES),
    quantity: z.coerce.number().int().positive("Jumlah harus lebih dari 0"),
    targetUnitId: z.string().uuid("Unit tujuan wajib dipilih"),
    transactionDate: z.coerce.date(),
    notes: z.string().trim().max(500).optional(),
  });

export type DistributionValues = z.infer<typeof distributionSchema>;
