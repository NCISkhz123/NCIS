import { describe, expect, it } from "vitest";

import { distributionSchema } from "@/lib/cssd/validators/distribution";
import { internalUsageSchema } from "@/lib/cssd/validators/internal-usage";
import { receiptSchema } from "@/lib/cssd/validators/receipt";
import { returnSchema } from "@/lib/cssd/validators/return";

const basePayload = {
  itemId: "11111111-1111-4111-8111-111111111111",
  notes: "Catatan uji",
  transactionDate: "2026-06-29",
};

describe("CSSD transaction validators", () => {
  it("rejects non-reusable items in the return flow", () => {
    const result = returnSchema.safeParse({
      ...basePayload,
      itemType: "CONSUMABLE_DISTRIBUTION",
      quantity: 2,
      sourceUnitId: "22222222-2222-4222-8222-222222222222",
      destinationPosition: "NON_STERILE",
    });

    expect(result.success).toBe(false);
  });

  it("allows consumable internal items only in internal usage", () => {
    const successResult = internalUsageSchema.safeParse({
      ...basePayload,
      itemType: "CONSUMABLE_INTERNAL",
      quantity: 1,
    });

    const failureResult = internalUsageSchema.safeParse({
      ...basePayload,
      itemType: "REUSABLE",
      quantity: 1,
    });

    expect(successResult.success).toBe(true);
    expect(failureResult.success).toBe(false);
  });

  it("requires positive quantity", () => {
    const result = receiptSchema.safeParse({
      ...basePayload,
      itemType: "REUSABLE",
      quantity: 0,
    });

    expect(result.success).toBe(false);
  });

  it("requires target unit for distribution", () => {
    const result = distributionSchema.safeParse({
      ...basePayload,
      itemType: "REUSABLE",
      quantity: 3,
      targetUnitId: "",
    });

    expect(result.success).toBe(false);
  });

  it("rejects consumable internal items in distribution", () => {
    const result = distributionSchema.safeParse({
      ...basePayload,
      itemType: "CONSUMABLE_INTERNAL",
      quantity: 3,
      targetUnitId: "22222222-2222-4222-8222-222222222222",
    });

    expect(result.success).toBe(false);
  });
});
