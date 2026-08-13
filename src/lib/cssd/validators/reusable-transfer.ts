import { z } from "zod";

import { REUSABLE_STOCK_POSITIONS } from "@/lib/cssd/constants";

export const reusableTransferSchema = z
  .object({
    itemId: z.string().uuid("Item wajib dipilih"),
    itemType: z.literal("REUSABLE"),
    quantity: z.coerce.number().int().positive("Jumlah harus lebih dari 0"),
    fromPosition: z.enum(REUSABLE_STOCK_POSITIONS),
    toPosition: z.enum(REUSABLE_STOCK_POSITIONS),
    transactionDate: z.coerce.date(),
    notes: z.string().trim().max(500).optional(),
    returnLineId: z.string().uuid().optional(),
  })
  .superRefine((value, ctx) => {
    const isValidFlow =
      (value.fromPosition === "NON_STERILE" &&
        value.toPosition === "STERILIZATION_AREA") ||
      (value.fromPosition === "STERILIZATION_AREA" &&
        value.toPosition === "READY") ||
      value.toPosition === "DAMAGED";

    if (!isValidFlow) {
      ctx.addIssue({
        code: "custom",
        message: "Perpindahan reusable tidak valid",
        path: ["toPosition"],
      });
    }
  });

export type ReusableTransferValues = z.infer<typeof reusableTransferSchema>;
