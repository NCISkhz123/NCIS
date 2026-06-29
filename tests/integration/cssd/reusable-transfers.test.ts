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
import { transferReusableStock } from "@/lib/cssd/services/reusable-transfers";

describe("CSSD reusable transfer service", () => {
  beforeAll(() => {
    ensureTestDatabase();
  }, 90_000);

  afterAll(() => {
    cleanupTestDatabase();
  }, 90_000);

  it("moves reusable stock from NON_STERILE to STERILIZATION_AREA and then to READY", async () => {
    const client = createTestRpcClient("ADMIN_CSSD");
    const itemId = createItem({ itemType: "REUSABLE" });

    seedStockBalance({
      itemId,
      stockPosition: "NON_STERILE",
      quantity: 4,
    });

    const sterilizationResult = await transferReusableStock(client, {
      itemId,
      itemType: "REUSABLE",
      quantity: 4,
      fromPosition: "NON_STERILE",
      toPosition: "STERILIZATION_AREA",
      transactionDate: "2026-06-29",
      notes: "Masuk area sterilisasi",
    });

    expect(sterilizationResult.success).toBe(true);
    expect(getStockBalance({ itemId, stockPosition: "NON_STERILE" })).toBe(0);
    expect(
      getStockBalance({ itemId, stockPosition: "STERILIZATION_AREA" })
    ).toBe(4);

    const readyResult = await transferReusableStock(client, {
      itemId,
      itemType: "REUSABLE",
      quantity: 4,
      fromPosition: "STERILIZATION_AREA",
      toPosition: "READY",
      transactionDate: "2026-06-29",
      notes: "Selesai steril",
    });

    expect(readyResult.success).toBe(true);
    expect(
      getStockBalance({ itemId, stockPosition: "STERILIZATION_AREA" })
    ).toBe(0);
    expect(getStockBalance({ itemId, stockPosition: "READY" })).toBe(4);
    expect(getLatestMovement({ itemId })).toMatchObject({
      movement_type: "REUSABLE_TRANSFER",
      from_position: "STERILIZATION_AREA",
      to_position: "READY",
      quantity: 4,
    });
  }, 20_000);
});
