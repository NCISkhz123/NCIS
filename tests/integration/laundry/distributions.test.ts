import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  cleanupTestDatabase,
  createHospitalUnit,
  createItem,
  createTestRpcClient,
  ensureTestDatabase,
  getLatestMovement,
  getStockBalance,
  seedStockBalance,
} from "./helpers/local-supabase";
import { distributeStock } from "@/lib/laundry/services/distributions";

describe("Laundry distributions service", () => {
  beforeAll(() => {
    ensureTestDatabase();
  }, 90_000);

  afterAll(() => {
    cleanupTestDatabase();
  }, 90_000);

  it("moves reusable stock from READY to IN_UNIT", async () => {
    const client = createTestRpcClient("ADMIN_LAUNDRY");
    const targetUnitId = createHospitalUnit();
    const itemId = createItem({ itemType: "REUSABLE" });

    seedStockBalance({
      itemId,
      stockPosition: "READY",
      quantity: 6,
    });

    const result = await distributeStock(client, {
      itemId,
      itemType: "REUSABLE",
      quantity: 4,
      targetUnitId,
      transactionDate: "2026-07-01",
      notes: "Distribusi linen reusable",
    });

    expect(result.success).toBe(true);
    expect(getStockBalance({ itemId, stockPosition: "READY" })).toBe(2);
    expect(
      getStockBalance({
        itemId,
        stockPosition: "IN_UNIT",
        hospitalUnitId: targetUnitId,
      })
    ).toBe(4);
    expect(getLatestMovement({ itemId })).toMatchObject({
      movement_type: "DISTRIBUTION",
      from_position: "READY",
      to_position: "IN_UNIT",
      hospital_unit_id: targetUnitId,
      quantity: 4,
    });
  }, 20_000);

  it("reduces consumable distribution stock and records the target unit", async () => {
    const client = createTestRpcClient("ADMIN_LAUNDRY");
    const targetUnitId = createHospitalUnit();
    const itemId = createItem({ itemType: "CONSUMABLE_DISTRIBUTION" });

    seedStockBalance({
      itemId,
      stockPosition: "READY",
      quantity: 10,
    });

    const result = await distributeStock(client, {
      itemId,
      itemType: "CONSUMABLE_DISTRIBUTION",
      quantity: 3,
      targetUnitId,
      transactionDate: "2026-07-01",
      notes: "Distribusi konsumabel laundry",
    });

    expect(result.success).toBe(true);
    expect(getStockBalance({ itemId, stockPosition: "READY" })).toBe(7);
    expect(
      getStockBalance({
        itemId,
        stockPosition: "IN_UNIT",
        hospitalUnitId: targetUnitId,
      })
    ).toBe(0);
    expect(getLatestMovement({ itemId })).toMatchObject({
      movement_type: "DISTRIBUTION",
      from_position: "READY",
      to_position: null,
      hospital_unit_id: targetUnitId,
      quantity: 3,
    });
  }, 20_000);
});
