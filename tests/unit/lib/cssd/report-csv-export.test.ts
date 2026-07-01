import { describe, expect, it } from "vitest";

import type {
  CurrentStockReportEntry,
  ItemStockCardEntry,
  TransactionHistoryReportEntry,
} from "@/lib/cssd/services/reports";
import {
  buildReportCsvFilename,
  buildStockCardCsvTable,
  buildStockStatusCsvTable,
  buildTransactionHistoryCsvTable,
} from "@/lib/cssd/reports/csv-export";

describe("cssd report csv export", () => {
  it("builds stock status csv headers and rows", () => {
    const table = buildStockStatusCsvTable([
      {
        itemId: "item-1",
        itemCode: "R-0001",
        itemName: "Set Minor",
        itemType: "REUSABLE",
        stockPosition: "READY",
        stockPositionLabel: "Steril",
        hospitalUnitId: null,
        hospitalUnitCode: null,
        hospitalUnitName: "CSSD",
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
    expect(table.rows).toEqual([["R-0001", "Set Minor", "Reusable", "Steril", "CSSD", 6]]);
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
        toPositionLabel: "Tidak Steril",
        flowLabel: "ICU -> Tidak Steril",
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
      ["01 Jul 2026", "R-0001", "Set Minor", "Reusable", 2, "ICU", "ICU -> Tidak Steril", "Kembali dari ICU"],
    ]);
  });

  it("builds stock card csv headers and preserves CSSD internal unit labels", () => {
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
        notes: "Masuk area sterilisasi",
        hospitalUnitId: null,
        hospitalUnitCode: null,
        hospitalUnitName: "CSSD",
        fromPosition: "NON_STERILE",
        fromPositionLabel: "Tidak Steril",
        toPosition: "STERILIZATION_AREA",
        toPositionLabel: "Area Sterilisasi",
        flowLabel: "Tidak Steril -> Area Sterilisasi",
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
        "Tidak Steril -> Area Sterilisasi",
        "CSSD",
        1,
        "Masuk area sterilisasi",
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
    ).toBe("kartu-stok-cssd-2026-07-01.csv");
  });
});
