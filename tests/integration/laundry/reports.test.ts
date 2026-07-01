import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { distributeStock } from "@/lib/laundry/services/distributions";
import { recordInternalUsage } from "@/lib/laundry/services/internal-usages";
import { receiveStock } from "@/lib/laundry/services/receipts";
import {
  listCurrentStockReport,
  listItemStockCardReport,
  listTransactionHistoryReport,
} from "@/lib/laundry/services/reports";
import { returnStock } from "@/lib/laundry/services/returns";
import { transferReusableStock } from "@/lib/laundry/services/reusable-transfers";
import {
  cleanupTestDatabase,
  createHospitalUnit,
  createItem,
  createSqlReportClient,
  createTestRpcClient,
  ensureTestDatabase,
  runSql,
} from "./helpers/local-supabase";

describe("Laundry reports service", () => {
  beforeAll(() => {
    ensureTestDatabase();
  }, 90_000);

  beforeEach(() => {
    runSql(`
      delete from public.laundry_stock_opname_lines;
      delete from public.laundry_stock_opname_sessions;
      delete from public.laundry_return_transaction_lines;
      delete from public.laundry_return_transactions;
      delete from public.laundry_distribution_transaction_lines;
      delete from public.laundry_distribution_transactions;
      delete from public.laundry_receipt_transaction_lines;
      delete from public.laundry_receipt_transactions;
      delete from public.laundry_internal_usage_transactions;
      delete from public.laundry_stock_movements;
      delete from public.laundry_stock_balances;
      delete from public.laundry_items;
      delete from public.laundry_hospital_units;
      delete from public.laundry_units_of_measure;
    `);
  });

  afterAll(() => {
    cleanupTestDatabase();
  }, 90_000);

  it("groups reusable balances by stock position in the current stock report", async () => {
    const unitId = createHospitalUnit("WARD-L-01");
    const reusableItemId = createItem({
      itemType: "REUSABLE",
      code: "LR-0001",
      name: "Linen Set Minor",
    });
    const stockClient = createTestRpcClient("ADMIN_LAUNDRY");
    const reportClient = createSqlReportClient("ADMIN_LAUNDRY");

    await receiveStock(stockClient, {
      itemId: reusableItemId,
      itemType: "REUSABLE",
      quantity: 10,
      transactionDate: "2026-07-01",
      notes: "Stok awal reusable laundry",
    });
    await distributeStock(stockClient, {
      itemId: reusableItemId,
      itemType: "REUSABLE",
      quantity: 4,
      targetUnitId: unitId,
      transactionDate: "2026-07-02",
      notes: "Distribusi ke ward",
    });
    await returnStock(stockClient, {
      itemId: reusableItemId,
      itemType: "REUSABLE",
      quantity: 2,
      sourceUnitId: unitId,
      destinationPosition: "NON_STERILE",
      transactionDate: "2026-07-03",
      notes: "Kembali untuk dicuci ulang",
    });
    await transferReusableStock(stockClient, {
      itemId: reusableItemId,
      itemType: "REUSABLE",
      quantity: 1,
      fromPosition: "NON_STERILE",
      toPosition: "STERILIZATION_AREA",
      transactionDate: "2026-07-04",
      notes: "Masuk area pencucian",
    });

    const report = await listCurrentStockReport(reportClient, {
      itemId: reusableItemId,
    });

    expect(report).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          itemId: reusableItemId,
          stockPosition: "READY",
          stockPositionLabel: "Bersih",
          quantity: 6,
          hospitalUnitId: null,
          hospitalUnitName: "Laundry",
        }),
        expect.objectContaining({
          itemId: reusableItemId,
          stockPosition: "NON_STERILE",
          stockPositionLabel: "Kotor",
          quantity: 1,
          hospitalUnitName: "Laundry",
        }),
        expect.objectContaining({
          itemId: reusableItemId,
          stockPosition: "STERILIZATION_AREA",
          stockPositionLabel: "Area Pencucian",
          quantity: 1,
          hospitalUnitName: "Laundry",
        }),
      ])
    );
  }, 60_000);

  it("shows movement traceability for one item in the stock card report", async () => {
    const unitId = createHospitalUnit("WARD-L-02");
    const reusableItemId = createItem({
      itemType: "REUSABLE",
      code: "LR-0002",
      name: "Set Linen Delivery",
    });
    const internalItemId = createItem({
      itemType: "CONSUMABLE_INTERNAL",
      code: "LCI-0001",
      name: "Chemical Laundry",
    });
    const stockClient = createTestRpcClient("ADMIN_LAUNDRY");
    const reportClient = createSqlReportClient("ADMIN_LAUNDRY");

    await receiveStock(stockClient, {
      itemId: reusableItemId,
      itemType: "REUSABLE",
      quantity: 5,
      transactionDate: "2026-07-01",
      notes: "Stok awal laundry set",
    });
    await receiveStock(stockClient, {
      itemId: internalItemId,
      itemType: "CONSUMABLE_INTERNAL",
      quantity: 9,
      transactionDate: "2026-07-01",
      notes: "Stok awal chemical laundry",
    });
    await distributeStock(stockClient, {
      itemId: reusableItemId,
      itemType: "REUSABLE",
      quantity: 3,
      targetUnitId: unitId,
      transactionDate: "2026-07-02",
      notes: "Distribusi ke ward",
    });
    await returnStock(stockClient, {
      itemId: reusableItemId,
      itemType: "REUSABLE",
      quantity: 2,
      sourceUnitId: unitId,
      destinationPosition: "NON_STERILE",
      transactionDate: "2026-07-03",
      notes: "Kembali dari ward",
    });
    await transferReusableStock(stockClient, {
      itemId: reusableItemId,
      itemType: "REUSABLE",
      quantity: 2,
      fromPosition: "NON_STERILE",
      toPosition: "STERILIZATION_AREA",
      transactionDate: "2026-07-04",
      notes: "Diproses pencucian",
    });
    await recordInternalUsage(stockClient, {
      itemId: internalItemId,
      itemType: "CONSUMABLE_INTERNAL",
      quantity: 2,
      transactionDate: "2026-07-05",
      notes: "Dipakai untuk proses laundry",
    });

    const stockCard = await listItemStockCardReport(reportClient, {
      itemId: reusableItemId,
    });
    const history = await listTransactionHistoryReport(reportClient, {
      itemId: reusableItemId,
      dateFrom: "2026-07-02",
      dateTo: "2026-07-04",
    });

    expect(history.map((entry) => entry.movementType)).toEqual([
      "REUSABLE_TRANSFER",
      "RETURN",
      "DISTRIBUTION",
    ]);
    expect(stockCard[0]).toMatchObject({
      itemId: reusableItemId,
      fromPosition: "NON_STERILE",
      fromPositionLabel: "Kotor",
      toPosition: "STERILIZATION_AREA",
      toPositionLabel: "Area Pencucian",
      hospitalUnitName: "Laundry",
      quantity: 2,
    });
    expect(stockCard.at(-1)).toMatchObject({
      itemId: reusableItemId,
      toPosition: "READY",
      toPositionLabel: "Bersih",
      hospitalUnitName: "Laundry",
    });
  }, 60_000);
});
