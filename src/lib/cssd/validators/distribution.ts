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
  })
  .superRefine((value, ctx) => {
    if (
      value.itemType !== "REUSABLE" &&
      value.itemType !== "CONSUMABLE_DISTRIBUTION"
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Distribusi hanya untuk reusable atau konsumabel distribusi",
        path: ["itemType"],
      });
    }
  });

export type DistributionValues = z.infer<typeof distributionSchema>;
