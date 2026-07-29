import { DataTable } from "@/components/data/data-table";
import { ITEM_TYPE_LABELS } from "@/lib/cssd/constants";
import type { TransactionHistoryEntry } from "@/lib/cssd/services/transaction-read-models";

type TransactionHistoryTableProps = {
  caption: string;
  rows: TransactionHistoryEntry[];
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
}: TransactionHistoryTableProps) {
  return (
    <DataTable
      caption={caption}
      columns={[
        "Tanggal",
        "Item",
        "Jenis",
        "Qty",
        "Unit",
        "Tujuan",
        "Catatan",
      ]}
        rows={
          rows.length
          ? rows.map((row) => [
              formatDateLabel(row.transactionDate),
              `${row.itemCode} - ${row.itemName}`,
              ITEM_TYPE_LABELS[row.itemType],
              <span key={`${row.id}-qty`} className="font-mono tabular-nums text-slate-900">
                {row.quantity}
              </span>,
              row.targetUnitName ?? "-",
              row.destinationLabel ?? "-",
              row.notes ?? "-",
            ])
          : [["-", "Belum ada transaksi", "-", "-", "-", "-", "-"]]
      }
    />
  );
}
