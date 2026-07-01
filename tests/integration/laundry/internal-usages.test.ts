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
import { recordInternalUsage } from "@/lib/laundry/services/internal-usages";

describe("Laundry internal usage service", () => {
  beforeAll(() => {
    ensureTestDatabase();
  }, 90_000);

  afterAll(() => {
    cleanupTestDatabase();
  }, 90_000);

  it("reduces READY stock and writes a movement for consumable internal items", async () => {
    const client = createTestRpcClient("ADMIN_LAUNDRY");
    const itemId = createItem({ itemType: "CONSUMABLE_INTERNAL" });

    seedStockBalance({
      itemId,
      stockPosition: "READY",
      quantity: 8,
    });

    const result = await recordInternalUsage(client, {
      itemId,
      itemType: "CONSUMABLE_INTERNAL",
      quantity: 3,
      transactionDate: "2026-07-01",
      notes: "Pakai chemical laundry",
    });

    expect(result.success).toBe(true);
    expect(getStockBalance({ itemId, stockPosition: "READY" })).toBe(5);
    expect(getLatestMovement({ itemId })).toMatchObject({
      movement_type: "INTERNAL_USAGE",
      from_position: "READY",
      to_position: null,
      quantity: 3,
    });
  }, 20_000);
});
