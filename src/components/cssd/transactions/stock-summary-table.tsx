import { DataTable } from "@/components/data/data-table";
import { ITEM_TYPE_LABELS } from "@/lib/cssd/constants";
import type { StockSummaryEntry } from "@/lib/cssd/services/transaction-read-models";

type StockSummaryTableProps = {
  caption: string;
  rows: StockSummaryEntry[];
};

export function StockSummaryTable({
  caption,
  rows,
}: StockSummaryTableProps) {
  return (
    <DataTable
      caption={caption}
      columns={["Item", "Jenis", "Posisi", "Unit", "Qty"]}
      rows={
        rows.length
          ? rows.map((row) => [
              `${row.itemCode} - ${row.itemName}`,
              ITEM_TYPE_LABELS[row.itemType],
              row.stockPositionLabel,
              row.hospitalUnitName ?? "-",
              <span key={`${row.itemId}-${row.stockPosition}-qty`} className="font-mono tabular-nums text-slate-900">
                {row.quantity}
              </span>,
            ])
          : [["-", "Belum ada stok", "-", "-", "-"]]
      }
    />
  );
}
