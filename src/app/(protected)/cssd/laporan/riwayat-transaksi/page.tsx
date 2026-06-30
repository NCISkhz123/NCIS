import { FilterField } from "@/components/cssd/reports/filter-field";
import { SectionHeader } from "@/components/cssd/reports/section-header";
import { TransactionHistoryTable } from "@/components/cssd/transactions/transaction-history-table";
import {
  createSupabaseReportClient,
  listTransactionHistoryReport,
} from "@/lib/cssd/services/reports";
import {
  listActiveHospitalUnits,
  listActiveItems,
} from "@/lib/cssd/services/transaction-read-models";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type QueryValue = string | string[] | undefined;

type RiwayatTransaksiPageProps = {
  searchParams?: Promise<{
    historyItem?: QueryValue;
    historyUnit?: QueryValue;
    historyFrom?: QueryValue;
    historyTo?: QueryValue;
  }>;
};

function normalizeQueryValue(value: QueryValue) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function RiwayatTransaksiPage({
  searchParams,
}: RiwayatTransaksiPageProps) {
  const params = (await searchParams) ?? {};
  const historyItem = normalizeQueryValue(params.historyItem);
  const historyUnit = normalizeQueryValue(params.historyUnit);
  const historyFrom = normalizeQueryValue(params.historyFrom);
  const historyTo = normalizeQueryValue(params.historyTo);

  const supabase = await createServerSupabaseClient();
  const reportClient = createSupabaseReportClient(supabase);

  const [items, hospitalUnits, transactionHistory] = await Promise.all([
    listActiveItems(supabase),
    listActiveHospitalUnits(supabase),
    listTransactionHistoryReport(reportClient, {
      itemId: historyItem,
      unitId: historyUnit,
      dateFrom: historyFrom,
      dateTo: historyTo,
      limit: 100,
    }),
  ]);

  return (
    <section className="shell-surface rounded-[1.9rem] p-6 md:p-8">
      <SectionHeader
        eyebrow="Riwayat Transaksi"
        title="Telusuri transaksi dengan filter tanggal"
        description="Filter rentang tanggal, item, dan unit untuk meninjau pola distribusi, pengembalian, pemakaian, atau perpindahan reusable."
      />

      <form className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-[1.2fr_1fr_0.9fr_0.9fr_auto]">
        <FilterField label="Item" htmlFor="history-item">
          <select
            id="history-item"
            name="historyItem"
            defaultValue={historyItem ?? ""}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
          >
            <option value="">Semua item</option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.code} - {item.name}
              </option>
            ))}
          </select>
        </FilterField>

        <FilterField label="Unit" htmlFor="history-unit">
          <select
            id="history-unit"
            name="historyUnit"
            defaultValue={historyUnit ?? ""}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
          >
            <option value="">Semua unit</option>
            {hospitalUnits.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name} ({unit.code})
              </option>
            ))}
          </select>
        </FilterField>

        <FilterField label="Dari Tanggal" htmlFor="history-from">
          <input
            id="history-from"
            type="date"
            name="historyFrom"
            defaultValue={historyFrom ?? ""}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
          />
        </FilterField>

        <FilterField label="Sampai Tanggal" htmlFor="history-to">
          <input
            id="history-to"
            type="date"
            name="historyTo"
            defaultValue={historyTo ?? ""}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
          />
        </FilterField>

        <div className="flex items-end gap-3">
          <button
            type="submit"
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Terapkan
          </button>
          <a
            href="/cssd/laporan/riwayat-transaksi"
            className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
          >
            Reset
          </a>
        </div>
      </form>

      <div className="mt-6">
        <TransactionHistoryTable
          caption="Riwayat transaksi CSSD"
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
          }))}
        />
      </div>
    </section>
  );
}
