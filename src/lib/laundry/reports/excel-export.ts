import { ITEM_TYPE_LABELS } from "@/lib/laundry/constants";
import type {
  CurrentStockReportEntry,
  ItemStockCardEntry,
  TransactionHistoryReportEntry,
} from "@/lib/laundry/services/reports";
import type { ExcelTable } from "@/lib/excel";

type ReportExcelKind = "stock-status" | "transaction-history" | "stock-card";

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

export function buildStockStatusExcelTable(
  rows: CurrentStockReportEntry[],
  title: string,
  period?: string
): ExcelTable {
  return {
    title,
    period,
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

export function buildTransactionHistoryExcelTable(
  rows: TransactionHistoryReportEntry[],
  title: string,
  period?: string
): ExcelTable {
  return {
    title,
    period,
    headers: [
      "Tanggal",
      "Transaksi",
      "Kode Item",
      "Nama Item",
      "Jenis",
      "Qty",
      "Unit",
    ],
    rows: rows.map((row) => [
      formatDateLabel(row.transactionDate),
      row.movementTypeLabel,
      row.itemCode,
      row.itemName,
      ITEM_TYPE_LABELS[row.itemType],
      row.quantity,
      fallbackCell(row.hospitalUnitName),
    ]),
  };
}

export function buildStockCardExcelTable(
  rows: ItemStockCardEntry[],
  title: string,
  period?: string
): ExcelTable {
  return {
    title,
    period,
    headers: ["Tanggal", "Transaksi", "Alur", "Unit", "Qty"],
    rows: rows.map((row) => [
      formatDateLabel(row.transactionDate),
      row.movementTypeLabel,
      row.flowLabel,
      fallbackCell(row.hospitalUnitName),
      row.quantity,
    ]),
  };
}

export function buildReportExcelFilename(
  kind: ReportExcelKind,
  options: {
    date: string;
    itemCode?: string;
  }
) {
  if (kind === "transaction-history") {
    return `riwayat-transaksi-laundry-${options.date}.xlsx`;
  }

  if (kind === "stock-status") {
    return `stok-status-laundry-${options.date}.xlsx`;
  }

  if (options.itemCode) {
    return `kartu-stok-${sanitizeFilenameSegment(options.itemCode)}-${options.date}.xlsx`;
  }

  return `kartu-stok-laundry-${options.date}.xlsx`;
}
