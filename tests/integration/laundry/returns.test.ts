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
import { returnStock } from "@/lib/laundry/services/returns";

describe("Laundry returns service", () => {
  beforeAll(() => {
    ensureTestDatabase();
  }, 90_000);

  afterAll(() => {
    cleanupTestDatabase();
  }, 90_000);

  it("moves reusable stock from IN_UNIT to NON_STERILE", async () => {
    const client = createTestRpcClient("ADMIN_LAUNDRY");
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
      transactionDate: "2026-07-01",
      notes: "Pengembalian linen reusable",
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
});
