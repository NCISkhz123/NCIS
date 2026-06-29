import { z } from "zod";

import { ITEM_TYPES, RETURN_DESTINATION_POSITIONS } from "@/lib/cssd/constants";

export const returnSchema = z
  .object({
    itemId: z.string().uuid("Item wajib dipilih"),
    itemType: z.enum(ITEM_TYPES),
    quantity: z.coerce.number().int().positive("Jumlah harus lebih dari 0"),
    sourceUnitId: z.string().uuid("Unit asal wajib dipilih"),
    destinationPosition: z.enum(RETURN_DESTINATION_POSITIONS),
    transactionDate: z.coerce.date(),
    notes: z.string().trim().max(500).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.itemType !== "REUSABLE") {
      ctx.addIssue({
        code: "custom",
        message: "Pengembalian hanya untuk item reusable",
        path: ["itemType"],
      });
    }
  });

export type ReturnValues = z.infer<typeof returnSchema>;
