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
} from "@/lib/cssd/services/stock-opname";

describe("CSSD stock opname service", () => {
  beforeAll(() => {
    ensureTestDatabase();
  }, 90_000);

  beforeEach(() => {
    runSql(`
      delete from public.stock_opname_lines;
      delete from public.stock_opname_sessions;
    `);
  });

  afterAll(() => {
    cleanupTestDatabase();
  }, 90_000);

  it("creates a draft session and draft lines without changing stock balances", async () => {
    const itemId = createItem({ itemType: "CONSUMABLE_INTERNAL" });
    const stockClient = createTestRpcClient("ADMIN_CSSD");

    seedStockBalance({
      itemId,
      stockPosition: "READY",
      quantity: 7,
    });

    const sessionResult = await createDraftStockOpnameSession(stockClient, {
      opnameDate: "2026-06-29",
      notes: "Draft opname chemical",
    });

    expect(sessionResult.success).toBe(true);

    if (!sessionResult.success) {
      return;
    }

    const lineResult = await saveStockOpnameLine(stockClient, sessionResult.data.id, {
      itemId,
      stockPosition: "READY",
      countedQuantity: 5,
      notes: "Hasil hitung chemical",
    });

    expect(lineResult.success).toBe(true);
    expect(getStockBalance({ itemId, stockPosition: "READY" })).toBe(7);

    const draftStatus = runSql(`
      select status
      from public.stock_opname_sessions
      where id = '${sessionResult.data.id}'
      limit 1;
    `);

    expect(draftStatus).toBe("DRAFT");
  }, 60_000);

  it("prevents creating a second draft session while another draft exists", async () => {
    const stockClient = createTestRpcClient("ADMIN_CSSD");

    const firstDraft = await createDraftStockOpnameSession(stockClient, {
      opnameDate: "2026-06-29",
      notes: "Draft pertama",
    });

    expect(firstDraft.success).toBe(true);

    const secondDraft = await createDraftStockOpnameSession(stockClient, {
      opnameDate: "2026-06-30",
      notes: "Draft kedua",
    });

    expect(secondDraft.success).toBe(false);
  }, 60_000);

  it("finalizes a draft session and creates adjustment movement rows", async () => {
    const itemId = createItem({ itemType: "REUSABLE" });
    const unitId = createHospitalUnit();
    const stockClient = createTestRpcClient("ADMIN_CSSD");

    seedStockBalance({
      itemId,
      stockPosition: "IN_UNIT",
      hospitalUnitId: unitId,
      quantity: 4,
    });

    const sessionResult = await createDraftStockOpnameSession(stockClient, {
      opnameDate: "2026-06-29",
      notes: "Hitung stok reusable",
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
      notes: "Selisih opname reusable",
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
