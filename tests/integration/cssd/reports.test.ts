import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { distributeStock } from "@/lib/cssd/services/distributions";
import { recordInternalUsage } from "@/lib/cssd/services/internal-usages";
import { receiveStock } from "@/lib/cssd/services/receipts";
import {
  listCurrentStockReport,
  listItemStockCardReport,
  listTransactionHistoryReport,
} from "@/lib/cssd/services/reports";
import { returnStock } from "@/lib/cssd/services/returns";
import { transferReusableStock } from "@/lib/cssd/services/reusable-transfers";
import {
  cleanupTestDatabase,
  createHospitalUnit,
  createItem,
  createSqlReportClient,
  createTestRpcClient,
  ensureTestDatabase,
  runSql,
} from "./helpers/local-supabase";

describe("CSSD reports service", () => {
  beforeAll(() => {
    ensureTestDatabase();
  }, 90_000);

  beforeEach(() => {
    runSql(`
      delete from public.stock_opname_lines;
      delete from public.stock_opname_sessions;
      delete from public.return_transaction_lines;
      delete from public.return_transactions;
      delete from public.distribution_transaction_lines;
      delete from public.distribution_transactions;
      delete from public.receipt_transaction_lines;
      delete from public.receipt_transactions;
      delete from public.internal_usage_transactions;
      delete from public.stock_movements;
      delete from public.stock_balances;
      delete from public.items;
      delete from public.hospital_units;
      delete from public.units_of_measure;
    `);
  });

  afterAll(() => {
    cleanupTestDatabase();
  }, 90_000);

  it("groups reusable balances by stock position in the current stock report", async () => {
    const unitId = createHospitalUnit("ICU-01");
    const reusableItemId = createItem({
      itemType: "REUSABLE",
      code: "R-0001",
      name: "Set Instrumen Minor",
    });
    const stockClient = createTestRpcClient("ADMIN_CSSD");
    const reportClient = createSqlReportClient("ADMIN_CSSD");

    await receiveStock(stockClient, {
      itemId: reusableItemId,
      itemType: "REUSABLE",
      quantity: 10,
      transactionDate: "2026-06-01",
      notes: "Stok awal reusable",
    });
    await distributeStock(stockClient, {
      itemId: reusableItemId,
      itemType: "REUSABLE",
      quantity: 4,
      targetUnitId: unitId,
      transactionDate: "2026-06-02",
      notes: "Distribusi ke ICU",
    });
    await returnStock(stockClient, {
      itemId: reusableItemId,
      itemType: "REUSABLE",
      quantity: 2,
      sourceUnitId: unitId,
      destinationPosition: "NON_STERILE",
      transactionDate: "2026-06-03",
      notes: "Kembali untuk disterilkan ulang",
    });
    await transferReusableStock(stockClient, {
      itemId: reusableItemId,
      itemType: "REUSABLE",
      quantity: 1,
      fromPosition: "NON_STERILE",
      toPosition: "STERILIZATION_AREA",
      transactionDate: "2026-06-04",
      notes: "Masuk area sterilisasi",
    });

    const report = await listCurrentStockReport(reportClient, {
      itemId: reusableItemId,
    });

    expect(report).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          itemId: reusableItemId,
          stockPosition: "READY",
          quantity: 6,
          hospitalUnitId: null,
          hospitalUnitName: "CSSD",
        }),
        expect.objectContaining({
          itemId: reusableItemId,
          stockPosition: "IN_UNIT",
          quantity: 2,
          hospitalUnitId: unitId,
        }),
        expect.objectContaining({
          itemId: reusableItemId,
          stockPosition: "NON_STERILE",
          quantity: 1,
          hospitalUnitId: null,
          hospitalUnitName: "CSSD",
        }),
        expect.objectContaining({
          itemId: reusableItemId,
          stockPosition: "STERILIZATION_AREA",
          quantity: 1,
          hospitalUnitId: null,
          hospitalUnitName: "CSSD",
        }),
      ])
    );
  }, 60_000);

  it("returns transaction history in reverse chronological order and labels internal cssd movements", async () => {
    const unitId = createHospitalUnit("OK-01");
    const reusableItemId = createItem({
      itemType: "REUSABLE",
      code: "R-0002",
      name: "Tray Operasi",
    });
    const stockClient = createTestRpcClient("ADMIN_CSSD");
    const reportClient = createSqlReportClient("ADMIN_CSSD");

    await receiveStock(stockClient, {
      itemId: reusableItemId,
      itemType: "REUSABLE",
      quantity: 8,
      transactionDate: "2026-06-01",
      notes: "Stok awal tray",
    });
    await distributeStock(stockClient, {
      itemId: reusableItemId,
      itemType: "REUSABLE",
      quantity: 3,
      targetUnitId: unitId,
      transactionDate: "2026-06-02",
      notes: "Distribusi ke OK",
    });
    await returnStock(stockClient, {
      itemId: reusableItemId,
      itemType: "REUSABLE",
      quantity: 2,
      sourceUnitId: unitId,
      destinationPosition: "NON_STERILE",
      transactionDate: "2026-06-03",
      notes: "Kembali dari OK",
    });
    await transferReusableStock(stockClient, {
      itemId: reusableItemId,
      itemType: "REUSABLE",
      quantity: 1,
      fromPosition: "NON_STERILE",
      toPosition: "STERILIZATION_AREA",
      transactionDate: "2026-06-04",
      notes: "Masuk sterilisasi",
    });

    const history = await listTransactionHistoryReport(reportClient, {
      itemId: reusableItemId,
      dateFrom: "2026-06-02",
      dateTo: "2026-06-04",
    });

    expect(history.map((entry) => entry.movementType)).toEqual([
      "REUSABLE_TRANSFER",
      "RETURN",
      "DISTRIBUTION",
    ]);
    expect(history.map((entry) => entry.transactionDate.slice(0, 10))).toEqual([
      "2026-06-04",
      "2026-06-03",
      "2026-06-02",
    ]);
    expect(history[0]).toMatchObject({
      movementType: "REUSABLE_TRANSFER",
      hospitalUnitId: null,
      hospitalUnitName: "CSSD",
      fromPosition: "NON_STERILE",
      toPosition: "STERILIZATION_AREA",
    });
    expect(history[1]).toMatchObject({
      movementType: "RETURN",
      hospitalUnitId: unitId,
      hospitalUnitName: expect.any(String),
    });
    expect(history[2]).toMatchObject({
      movementType: "DISTRIBUTION",
      hospitalUnitId: unitId,
      hospitalUnitName: expect.any(String),
    });
  }, 60_000);

  it("shows movement traceability for one item in the stock card report", async () => {
    const unitId = createHospitalUnit("VK-01");
    const reusableItemId = createItem({
      itemType: "REUSABLE",
      code: "R-0003",
      name: "Set Delivery",
    });
    const internalItemId = createItem({
      itemType: "CONSUMABLE_INTERNAL",
      code: "CI-0001",
      name: "Chemical Sterilizer",
    });
    const stockClient = createTestRpcClient("ADMIN_CSSD");
    const reportClient = createSqlReportClient("ADMIN_CSSD");

    await receiveStock(stockClient, {
      itemId: reusableItemId,
      itemType: "REUSABLE",
      quantity: 5,
      transactionDate: "2026-06-01",
      notes: "Stok awal delivery set",
    });
    await receiveStock(stockClient, {
      itemId: internalItemId,
      itemType: "CONSUMABLE_INTERNAL",
      quantity: 9,
      transactionDate: "2026-06-01",
      notes: "Stok awal chemical",
    });
    await distributeStock(stockClient, {
      itemId: reusableItemId,
      itemType: "REUSABLE",
      quantity: 3,
      targetUnitId: unitId,
      transactionDate: "2026-06-02",
      notes: "Distribusi ke VK",
    });
    await returnStock(stockClient, {
      itemId: reusableItemId,
      itemType: "REUSABLE",
      quantity: 2,
      sourceUnitId: unitId,
      destinationPosition: "NON_STERILE",
      transactionDate: "2026-06-03",
      notes: "Kembali dari VK",
    });
    await transferReusableStock(stockClient, {
      itemId: reusableItemId,
      itemType: "REUSABLE",
      quantity: 2,
      fromPosition: "NON_STERILE",
      toPosition: "STERILIZATION_AREA",
      transactionDate: "2026-06-04",
      notes: "Diproses sterilisasi",
    });
    await recordInternalUsage(stockClient, {
      itemId: internalItemId,
      itemType: "CONSUMABLE_INTERNAL",
      quantity: 2,
      transactionDate: "2026-06-05",
      notes: "Dipakai untuk proses sterilisasi",
    });

    const stockCard = await listItemStockCardReport(reportClient, {
      itemId: reusableItemId,
    });

    expect(stockCard.map((entry) => entry.movementType)).toEqual([
      "REUSABLE_TRANSFER",
      "RETURN",
      "DISTRIBUTION",
      "RECEIPT",
    ]);
    expect(stockCard[0]).toMatchObject({
      itemId: reusableItemId,
      fromPosition: "NON_STERILE",
      toPosition: "STERILIZATION_AREA",
      hospitalUnitName: "CSSD",
      quantity: 2,
    });
    expect(stockCard[1]).toMatchObject({
      itemId: reusableItemId,
      fromPosition: "IN_UNIT",
      toPosition: "NON_STERILE",
      hospitalUnitId: unitId,
      hospitalUnitName: expect.any(String),
    });
    expect(stockCard[2]).toMatchObject({
      itemId: reusableItemId,
      toPosition: "IN_UNIT",
      hospitalUnitId: unitId,
      hospitalUnitName: expect.any(String),
    });
    expect(stockCard[3]).toMatchObject({
      itemId: reusableItemId,
      toPosition: "READY",
      hospitalUnitId: null,
      hospitalUnitName: "CSSD",
    });
    expect(stockCard.every((entry) => entry.itemId === reusableItemId)).toBe(true);
  }, 60_000);
});
