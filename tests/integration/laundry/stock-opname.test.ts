import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import {
  cleanupTestDatabase,
  createHospitalUnit,
  createItem,
  createTestRpcClient,
  ensureTestDatabase,
  getLatestMovement,
  getStockBalance,
  runSql,
  seedStockBalance,
} from "./helpers/local-supabase";
import {
  createDraftStockOpnameSession,
  finalizeStockOpnameSession,
  saveStockOpnameLine,
} from "@/lib/laundry/services/stock-opname";

describe("Laundry stock opname service", () => {
  beforeAll(() => {
    ensureTestDatabase();
  }, 90_000);

  beforeEach(() => {
    runSql(`
      delete from public.laundry_stock_opname_lines;
      delete from public.laundry_stock_opname_sessions;
    `);
  });

  afterAll(() => {
    cleanupTestDatabase();
  }, 90_000);

  it("finalizes a draft session and creates adjustment movement rows", async () => {
    const itemId = createItem({ itemType: "REUSABLE" });
    const unitId = createHospitalUnit();
    const stockClient = createTestRpcClient("ADMIN_LAUNDRY");

    seedStockBalance({
      itemId,
      stockPosition: "IN_UNIT",
      hospitalUnitId: unitId,
      quantity: 4,
    });

    const sessionResult = await createDraftStockOpnameSession(stockClient, {
      opnameDate: "2026-07-01",
      notes: "Hitung stok laundry reusable",
    });

    expect(sessionResult.success).toBe(true);

    if (!sessionResult.success) {
      return;
    }

    const lineResult = await saveStockOpnameLine(stockClient, sessionResult.data.id, {
      itemId,
      stockPosition: "IN_UNIT",
      hospitalUnitId: unitId,
      countedQuantity: 2,
      notes: "Selisih opname laundry reusable",
    });

    expect(lineResult.success).toBe(true);

    const finalizeResult = await finalizeStockOpnameSession(
      stockClient,
      sessionResult.data.id
    );

    expect(finalizeResult.success).toBe(true);
    expect(
      getStockBalance({
        itemId,
        stockPosition: "IN_UNIT",
        hospitalUnitId: unitId,
      })
    ).toBe(2);
    expect(getLatestMovement({ itemId })).toMatchObject({
      movement_type: "ADJUSTMENT",
      from_position: "IN_UNIT",
      quantity: 2,
      hospital_unit_id: unitId,
    });
  }, 60_000);
});
