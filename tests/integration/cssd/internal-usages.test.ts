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
import { recordInternalUsage } from "@/lib/cssd/services/internal-usages";

describe("CSSD internal usage service", () => {
  beforeAll(() => {
    ensureTestDatabase();
  }, 90_000);

  afterAll(() => {
    cleanupTestDatabase();
  }, 90_000);

  it("reduces READY stock and writes a movement for consumable internal items", async () => {
    const client = createTestRpcClient("ADMIN_CSSD");
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
      transactionDate: "2026-06-29",
      notes: "Pakai chemical",
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

  it("rejects non-consumable-internal items", async () => {
    const client = createTestRpcClient("ADMIN_CSSD");
    const itemId = createItem({ itemType: "REUSABLE" });

    const result = await recordInternalUsage(client, {
      itemId,
      itemType: "REUSABLE",
      quantity: 1,
      transactionDate: "2026-06-29",
      notes: "Should fail",
    });

    expect(result.success).toBe(false);
  }, 20_000);
});
