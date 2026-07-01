import { describe, expect, it } from "vitest";

import type {
  CurrentStockReportEntry,
  ItemStockCardEntry,
  TransactionHistoryReportEntry,
} from "@/lib/laundry/services/reports";
import {
  buildReportCsvFilename,
  buildStockCardCsvTable,
  buildStockStatusCsvTable,
  buildTransactionHistoryCsvTable,
} from "@/lib/laundry/reports/csv-export";

describe("laundry report csv export", () => {
  it("builds stock status csv headers and rows", () => {
    const table = buildStockStatusCsvTable([
      {
        itemId: "item-1",
        itemCode: "R-0001",
        itemName: "Set Minor",
        itemType: "REUSABLE",
        stockPosition: "READY",
        stockPositionLabel: "Bersih",
        hospitalUnitId: null,
        hospitalUnitCode: null,
        hospitalUnitName: "Laundry",
        quantity: 6,
        updatedAt: "2026-07-01T00:00:00.000Z",
      } satisfies CurrentStockReportEntry,
    ]);

    expect(table.headers).toEqual([
      "Kode Item",
      "Nama Item",
      "Jenis",
      "Posisi",
      "Unit",
      "Qty",
    ]);
    expect(table.rows).toEqual([["R-0001", "Set Minor", "Reusable", "Bersih", "Laundry", 6]]);
  });

  it("builds transaction history csv headers and rows", () => {
    const table = buildTransactionHistoryCsvTable([
      {
        movementId: "move-1",
        itemId: "item-1",
        itemCode: "R-0001",
        itemName: "Set Minor",
        itemType: "REUSABLE",
        movementType: "RETURN",
        movementTypeLabel: "Pengembalian",
        transactionDate: "2026-07-01T00:00:00.000Z",
        quantity: 2,
        notes: "Kembali dari ICU",
        hospitalUnitId: "unit-1",
        hospitalUnitCode: "ICU-01",
        hospitalUnitName: "ICU",
        fromPosition: "IN_UNIT",
        fromPositionLabel: "Di Unit",
        toPosition: "NON_STERILE",
        toPositionLabel: "Kotor",
        flowLabel: "ICU -> Kotor",
      } satisfies TransactionHistoryReportEntry,
    ]);

    expect(table.headers).toEqual([
      "Tanggal",
      "Kode Item",
      "Nama Item",
      "Jenis",
      "Qty",
      "Unit",
      "Tujuan",
      "Catatan",
    ]);
    expect(table.rows).toEqual([
      ["01 Jul 2026", "R-0001", "Set Minor", "Reusable", 2, "ICU", "ICU -> Kotor", "Kembali dari ICU"],
    ]);
  });

  it("builds stock card csv headers and preserves Laundry internal unit labels", () => {
    const table = buildStockCardCsvTable([
      {
        movementId: "move-1",
        itemId: "item-1",
        itemCode: "R-0001",
        itemName: "Set Minor",
        itemType: "REUSABLE",
        movementType: "REUSABLE_TRANSFER",
        movementTypeLabel: "Perpindahan Reusable",
        transactionDate: "2026-07-02T00:00:00.000Z",
        quantity: 1,
        notes: "Masuk area pencucian",
        hospitalUnitId: null,
        hospitalUnitCode: null,
        hospitalUnitName: "Laundry",
        fromPosition: "NON_STERILE",
        fromPositionLabel: "Kotor",
        toPosition: "STERILIZATION_AREA",
        toPositionLabel: "Area Pencucian",
        flowLabel: "Kotor -> Area Pencucian",
      } satisfies ItemStockCardEntry,
    ]);

    expect(table.headers).toEqual([
      "Tanggal",
      "Transaksi",
      "Alur",
      "Unit",
      "Qty",
      "Catatan",
    ]);
    expect(table.rows).toEqual([
      [
        "02 Jul 2026",
        "Perpindahan Reusable",
        "Kotor -> Area Pencucian",
        "Laundry",
        1,
        "Masuk area pencucian",
      ],
    ]);
  });

  it("builds report filenames with item code when available", () => {
    expect(
      buildReportCsvFilename("stock-card", {
        date: "2026-07-01",
        itemCode: "R-0001",
      })
    ).toBe("kartu-stok-R-0001-2026-07-01.csv");
  });

  it("falls back safely when stock card item code is missing", () => {
    expect(
      buildReportCsvFilename("stock-card", {
        date: "2026-07-01",
      })
    ).toBe("kartu-stok-laundry-2026-07-01.csv");
  });
});

