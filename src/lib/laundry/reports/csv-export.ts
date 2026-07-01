import { ITEM_TYPE_LABELS } from "@/lib/laundry/constants";
import type {
  CurrentStockReportEntry,
  ItemStockCardEntry,
  TransactionHistoryReportEntry,
} from "@/lib/laundry/services/reports";

type CsvCell = string | number | null | undefined;

export type CsvTable = {
  headers: string[];
  rows: CsvCell[][];
};

type ReportCsvKind = "stock-status" | "transaction-history" | "stock-card";

function formatDateLabel(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function fallbackCell(value: string | null) {
  return value ?? "-";
}

function sanitizeFilenameSegment(value: string) {
  return value.replaceAll(/[^a-zA-Z0-9-_]+/g, "-");
}

export function buildStockStatusCsvTable(
  rows: CurrentStockReportEntry[]
): CsvTable {
  return {
    headers: ["Kode Item", "Nama Item", "Jenis", "Posisi", "Unit", "Qty"],
    rows: rows.map((row) => [
      row.itemCode,
      row.itemName,
      ITEM_TYPE_LABELS[row.itemType],
      row.stockPositionLabel,
      fallbackCell(row.hospitalUnitName),
      row.quantity,
    ]),
  };
}

export function buildTransactionHistoryCsvTable(
  rows: TransactionHistoryReportEntry[]
): CsvTable {
  return {
    headers: [
      "Tanggal",
      "Kode Item",
      "Nama Item",
      "Jenis",
      "Qty",
      "Unit",
      "Tujuan",
      "Catatan",
    ],
    rows: rows.map((row) => [
      formatDateLabel(row.transactionDate),
      row.itemCode,
      row.itemName,
      ITEM_TYPE_LABELS[row.itemType],
      row.quantity,
      fallbackCell(row.hospitalUnitName),
      row.flowLabel,
      fallbackCell(row.notes),
    ]),
  };
}

export function buildStockCardCsvTable(rows: ItemStockCardEntry[]): CsvTable {
  return {
    headers: ["Tanggal", "Transaksi", "Alur", "Unit", "Qty", "Catatan"],
    rows: rows.map((row) => [
      formatDateLabel(row.transactionDate),
      row.movementTypeLabel,
      row.flowLabel,
      fallbackCell(row.hospitalUnitName),
      row.quantity,
      fallbackCell(row.notes),
    ]),
  };
}

export function buildReportCsvFilename(
  kind: ReportCsvKind,
  options: {
    date: string;
    itemCode?: string;
  }
) {
  if (kind === "transaction-history") {
    return `riwayat-transaksi-laundry-${options.date}.csv`;
  }

  if (kind === "stock-status") {
    return `stok-status-laundry-${options.date}.csv`;
  }

  if (options.itemCode) {
    return `kartu-stok-${sanitizeFilenameSegment(options.itemCode)}-${options.date}.csv`;
  }

  return `kartu-stok-laundry-${options.date}.csv`;
}

