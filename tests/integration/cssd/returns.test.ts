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
import { returnStock } from "@/lib/cssd/services/returns";

describe("CSSD returns service", () => {
  beforeAll(() => {
    ensureTestDatabase();
  }, 90_000);

  afterAll(() => {
    cleanupTestDatabase();
  }, 90_000);

  it("moves reusable stock from IN_UNIT to NON_STERILE", async () => {
    const client = createTestRpcClient("ADMIN_CSSD");
    const sourceUnitId = createHospitalUnit();
    const itemId = createItem({ itemType: "REUSABLE" });

    seedStockBalance({
      itemId,
      stockPosition: "IN_UNIT",
      hospitalUnitId: sourceUnitId,
      quantity: 5,
    });

    const result = await returnStock(client, {
      itemId,
      itemType: "REUSABLE",
      quantity: 3,
      sourceUnitId,
      destinationPosition: "NON_STERILE",
      transactionDate: "2026-06-29",
      notes: "Pengembalian reusable",
    });

    expect(result.success).toBe(true);
    expect(
      getStockBalance({
        itemId,
        stockPosition: "IN_UNIT",
        hospitalUnitId: sourceUnitId,
      })
    ).toBe(2);
    expect(getStockBalance({ itemId, stockPosition: "NON_STERILE" })).toBe(3);
    expect(getLatestMovement({ itemId })).toMatchObject({
      movement_type: "RETURN",
      from_position: "IN_UNIT",
      to_position: "NON_STERILE",
      hospital_unit_id: sourceUnitId,
      quantity: 3,
    });
  }, 20_000);

  it("allows return to DAMAGED for reusable items", async () => {
    const client = createTestRpcClient("ADMIN_CSSD");
    const sourceUnitId = createHospitalUnit();
    const itemId = createItem({ itemType: "REUSABLE" });

    seedStockBalance({
      itemId,
      stockPosition: "IN_UNIT",
      hospitalUnitId: sourceUnitId,
      quantity: 2,
    });

    const result = await returnStock(client, {
      itemId,
      itemType: "REUSABLE",
      quantity: 2,
      sourceUnitId,
      destinationPosition: "DAMAGED",
      transactionDate: "2026-06-29",
      notes: "Rusak",
    });

    expect(result.success).toBe(true);
    expect(getStockBalance({ itemId, stockPosition: "DAMAGED" })).toBe(2);
  }, 20_000);

  it("rejects non-reusable items in the return flow", async () => {
    const client = createTestRpcClient("ADMIN_CSSD");
    const sourceUnitId = createHospitalUnit();
    const itemId = createItem({ itemType: "CONSUMABLE_DISTRIBUTION" });

    const result = await returnStock(client, {
      itemId,
      itemType: "CONSUMABLE_DISTRIBUTION",
      quantity: 1,
      sourceUnitId,
      destinationPosition: "NON_STERILE",
      transactionDate: "2026-06-29",
      notes: "Should fail",
    });

    expect(result.success).toBe(false);
  }, 20_000);
});
