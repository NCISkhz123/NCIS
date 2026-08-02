import { DataTable } from "@/components/data/data-table";
import { ITEM_TYPE_LABELS } from "@/lib/laundry/constants";
import type { TransactionHistoryEntry } from "@/lib/laundry/services/transaction-read-models";

type TransactionHistoryTableProps = {
  caption: string;
  rows: TransactionHistoryEntry[];
  showTransactionType?: boolean;
};

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

export function TransactionHistoryTable({
  caption,
  rows,
  showTransactionType,
}: TransactionHistoryTableProps) {
  const columns = ["Tanggal"];
  if (showTransactionType) {
    columns.push("Transaksi");
  }
  columns.push("Nama Item", "Kode Item", "Jenis", "Qty", "Unit");

  return (
    <DataTable
      caption={caption}
      columns={columns}
        rows={
          rows.length
          ? rows.map((row) => {
              const baseRow = [
                formatDateLabel(row.transactionDate),
              ];
              if (showTransactionType) {
                baseRow.push(row.movementTypeLabel ?? "-");
              }
              return [
                ...baseRow,
                row.itemName,
                row.itemCode,
                ITEM_TYPE_LABELS[row.itemType],
                <span key={`${row.id}-qty`} className="font-mono tabular-nums text-slate-900">
                  {row.quantity}
                </span>,
                row.targetUnitName ?? "-",
              ];
            })
          : [Array(columns.length).fill("-").map((_, i) => i === 1 ? "Belum ada transaksi" : "-")]
      }
    />
  );
}
