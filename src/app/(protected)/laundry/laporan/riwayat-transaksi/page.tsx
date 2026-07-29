import { FilterField } from "@/components/laundry/reports/filter-field";
import { SectionHeader } from "@/components/laundry/reports/section-header";
import { ReportActionLink } from "@/components/reports/report-action";
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
    historyFrom?: QueryValue;
    historyTo?: QueryValue;
  }>;
};

function normalizeQueryValue(value: QueryValue) {
  return Array.isArray(value) ? value[0] : value;
}

function formatDateLabel(value?: string) {
  if (!value) {
    return null;
  }

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

function buildPeriodLabel(from?: string, to?: string) {
  const fromLabel = formatDateLabel(from);
  const toLabel = formatDateLabel(to);

  if (!fromLabel && !toLabel) {
    return "Semua tanggal";
  }

  return `${fromLabel ?? "Awal"} - ${toLabel ?? "Sekarang"}`;
}

function buildExportHref(input: {
  historyItem?: string;
  historyUnit?: string;
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
    }),
  ]);
  const exportHref = buildExportHref({
    historyItem,
    historyUnit,
    historyFrom,
    historyTo,
  });
  const activeFilterCount = [
    historyItem,
    historyUnit,
    historyFrom,
    historyTo,
  ].filter(Boolean).length;
  const periodLabel = buildPeriodLabel(historyFrom, historyTo);

  return (
    <section className="shell-surface rounded-[1.9rem] p-6 md:p-8">
      <SectionHeader
        eyebrow="Riwayat Transaksi"
        title="Riwayat transaksi"
        description="Cari transaksi lalu ekspor bila diperlukan."
      />

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <div className="rounded-[1.4rem] border border-slate-200 bg-white/80 p-4">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Data tampil
          </p>
          <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-slate-950">
            {transactionHistory.length}
          </p>
        </div>
        <div className="rounded-[1.4rem] border border-slate-200 bg-white/80 p-4">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Periode
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-950">
            {periodLabel}
          </p>
        </div>
        <div className="rounded-[1.4rem] border border-slate-200 bg-white/80 p-4">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Filter aktif
          </p>
          <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-slate-950">
            {activeFilterCount}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-[1.6rem] border border-slate-200 bg-slate-50/80 p-5">
        <div className="flex flex-col gap-2">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Filter
          </p>
          <p className="text-sm leading-6 text-slate-600">
            Atur filter lalu tampilkan hasil.
          </p>
        </div>

        <form className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-[1.2fr_1fr_0.9fr_0.9fr_auto]">
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
            <button
              type="submit"
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Terapkan
            </button>
            <ReportActionLink href={exportHref} variant="export">
              Ekspor CSV
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
