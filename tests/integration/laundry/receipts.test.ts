import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  cleanupTestDatabase,
  createItem,
  createTestRpcClient,
  ensureTestDatabase,
  getLatestMovement,
  getStockBalance,
} from "./helpers/local-supabase";
import { receiveStock } from "@/lib/laundry/services/receipts";

describe("Laundry receipts service", () => {
  beforeAll(() => {
    ensureTestDatabase();
  }, 90_000);

  afterAll(() => {
    cleanupTestDatabase();
  }, 90_000);

  it("adds stock into READY and writes a receipt movement", async () => {
    const client = createTestRpcClient("ADMIN_LAUNDRY");
    const itemId = createItem({ itemType: "REUSABLE" });

    const result = await receiveStock(client, {
      itemId,
      itemType: "REUSABLE",
      quantity: 5,
      transactionDate: "2026-07-01",
      notes: "Pemasukan laundry reusable",
    });

    expect(result.success).toBe(true);
    expect(getStockBalance({ itemId, stockPosition: "READY" })).toBe(5);
    expect(getLatestMovement({ itemId })).toMatchObject({
      movement_type: "RECEIPT",
      from_position: null,
      to_position: "READY",
      quantity: 5,
    });
  }, 20_000);
});
