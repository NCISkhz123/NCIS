import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  cleanupTestDatabase,
  createItem,
  createTestRpcClient,
  ensureTestDatabase,
  getLatestMovement,
  getStockBalance,
  seedStockBalance,
} from "./helpers/local-supabase";
import { transferReusableStock } from "@/lib/laundry/services/reusable-transfers";

describe("Laundry reusable transfers service", () => {
  beforeAll(() => {
    ensureTestDatabase();
  }, 90_000);

  afterAll(() => {
    cleanupTestDatabase();
  }, 90_000);

  it("moves reusable stock from NON_STERILE to STERILIZATION_AREA", async () => {
    const client = createTestRpcClient("ADMIN_LAUNDRY");
    const itemId = createItem({ itemType: "REUSABLE" });

    seedStockBalance({
      itemId,
      stockPosition: "NON_STERILE",
      quantity: 4,
    });

    const result = await transferReusableStock(client, {
      itemId,
      itemType: "REUSABLE",
      quantity: 3,
      fromPosition: "NON_STERILE",
      toPosition: "STERILIZATION_AREA",
      transactionDate: "2026-07-01",
      notes: "Masuk area pencucian",
    });

    expect(result.success).toBe(true);
    expect(getStockBalance({ itemId, stockPosition: "NON_STERILE" })).toBe(1);
    expect(getStockBalance({ itemId, stockPosition: "STERILIZATION_AREA" })).toBe(3);
    expect(getLatestMovement({ itemId })).toMatchObject({
      movement_type: "REUSABLE_TRANSFER",
      from_position: "NON_STERILE",
      to_position: "STERILIZATION_AREA",
      quantity: 3,
    });
  }, 20_000);
});
