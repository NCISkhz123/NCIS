import { FilterField } from "@/components/laundry/reports/filter-field";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  ReportActionButton,
  ReportActionLink,
} from "@/components/reports/report-action";
import { TransactionHistoryTable } from "@/components/laundry/transactions/transaction-history-table";
import {
  createSupabaseReportClient,
  listTransactionHistoryReport,
} from "@/lib/laundry/services/reports";
import {
  listActiveHospitalUnits,
  listActiveItems,
} from "@/lib/laundry/services/transaction-read-models";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type QueryValue = string | string[] | undefined;

type RiwayatTransaksiPageProps = {
  searchParams?: Promise<{
    historyItem?: QueryValue;
    historyUnit?: QueryValue;
    historyType?: QueryValue;
    historyFrom?: QueryValue;
    historyTo?: QueryValue;
  }>;
};

function normalizeQueryValue(value: QueryValue) {
  return Array.isArray(value) ? value[0] : value;
}


function buildExportHref(input: {
  historyItem?: string;
  historyUnit?: string;
  historyType?: string;
  historyFrom?: string;
  historyTo?: string;
}) {
  const params = new URLSearchParams();

  if (input.historyItem) {
    params.set("historyItem", input.historyItem);
  }

  if (input.historyUnit) {
    params.set("historyUnit", input.historyUnit);
  }

  if (input.historyType) {
    params.set("historyType", input.historyType);
  }

  if (input.historyFrom) {
    params.set("historyFrom", input.historyFrom);
  }

  if (input.historyTo) {
    params.set("historyTo", input.historyTo);
  }

  const query = params.toString();

  return query
    ? `/laundry/laporan/riwayat-transaksi/export?${query}`
    : "/laundry/laporan/riwayat-transaksi/export";
}

export default async function RiwayatTransaksiPage({
  searchParams,
}: RiwayatTransaksiPageProps) {
  const params = (await searchParams) ?? {};
  const historyItem = normalizeQueryValue(params.historyItem);
  const historyUnit = normalizeQueryValue(params.historyUnit);
  const historyType = normalizeQueryValue(params.historyType);
  const historyFrom = normalizeQueryValue(params.historyFrom);
  const historyTo = normalizeQueryValue(params.historyTo);

  const supabase = await createServerSupabaseClient();
  const reportClient = createSupabaseReportClient(supabase);

  const [items, hospitalUnits, transactionHistory] = await Promise.all([
    listActiveItems(supabase),
    listActiveHospitalUnits(supabase),
    listTransactionHistoryReport(reportClient, {
      itemId: historyItem,
      unitId: historyUnit === "INTERNAL" ? null : historyUnit,
      movementType: historyType,
      dateFrom: historyFrom,
      dateTo: historyTo,
    }),
  ]);
  const exportHref = buildExportHref({
    historyItem,
    historyUnit,
    historyType,
    historyFrom,
    historyTo,
  });

  return (
    <section className="shell-surface rounded-[1.9rem] p-6 md:p-8">
      <div className="rounded-[1.6rem] border border-slate-200 bg-slate-50/80 p-5">


        <form className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-[1.2fr_1fr_0.9fr_0.9fr_auto]">
          <FilterField label="Item" htmlFor="history-item">
            <SearchableSelect
              id="history-item"
              name="historyItem"
              defaultValue={historyItem ?? ""}
              options={items.map((item) => ({
                value: item.id,
                label: item.name,
              }))}
              placeholder="Semua item"
            />
          </FilterField>

          <FilterField label="Unit" htmlFor="history-unit">
            <select
              id="history-unit"
              name="historyUnit"
              defaultValue={historyUnit ?? ""}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
            >
              <option value="">Semua unit</option>
              <option value="INTERNAL">Laundry</option>
              {hospitalUnits.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name} ({unit.code})
                </option>
              ))}
            </select>
          </FilterField>

          <FilterField label="Jenis transaksi" htmlFor="history-type">
            <select
              id="history-type"
              name="historyType"
              defaultValue={historyType ?? ""}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
            >
              <option value="">Semua transaksi</option>
              <option value="RECEIPT">Pemasukan</option>
              <option value="DISTRIBUTION">Distribusi</option>
              <option value="RETURN">Pengembalian</option>
              <option value="INTERNAL_USAGE">Pemakaian Internal</option>
              <option value="STOCK_OPNAME">Stock Opname</option>
              <option value="ADJUSTMENT">Penyesuaian</option>
              <option value="REUSABLE_TRANSFER">Perpindahan Reusable</option>
            </select>
          </FilterField>

          <FilterField label="Dari tanggal" htmlFor="history-from">
            <input
              id="history-from"
              type="date"
              name="historyFrom"
              defaultValue={historyFrom ?? ""}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
            />
          </FilterField>

          <FilterField label="Sampai tanggal" htmlFor="history-to">
            <input
              id="history-to"
              type="date"
              name="historyTo"
              defaultValue={historyTo ?? ""}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
            />
          </FilterField>

          <div className="flex flex-wrap items-end gap-3">
            <ReportActionButton type="submit" variant="primary">
              Terapkan
            </ReportActionButton>
            <ReportActionLink href={exportHref} variant="export">
              Ekspor Excel
            </ReportActionLink>
            <ReportActionLink href="/laundry/laporan/riwayat-transaksi">
              Reset
            </ReportActionLink>
          </div>
        </form>
      </div>

      <div className="mt-6">
        <div className="mb-4">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Hasil
          </p>
          <h3 className="mt-2 text-lg font-semibold tracking-[-0.03em] text-slate-950">
            Riwayat
          </h3>
        </div>
        <TransactionHistoryTable
          caption="Riwayat transaksi"
          showTransactionType
          rows={transactionHistory.map((row) => ({
            id: row.movementId,
            referenceNo: null,
            transactionDate: row.transactionDate,
            itemName: row.itemName,
            itemCode: row.itemCode,
            itemType: row.itemType,
            quantity: row.quantity,
            notes: row.notes,
            targetUnitName: row.hospitalUnitName,
            destinationLabel: row.flowLabel,
            movementTypeLabel: row.movementTypeLabel,
          }))}
        />
      </div>
    </section>
  );
}
