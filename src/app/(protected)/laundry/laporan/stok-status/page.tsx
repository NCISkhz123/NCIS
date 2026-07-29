import { FilterField } from "@/components/laundry/reports/filter-field";
import { SectionHeader } from "@/components/laundry/reports/section-header";
import { ReportActionLink } from "@/components/reports/report-action";
import { StockSummaryTable } from "@/components/laundry/transactions/stock-summary-table";
import {
  createSupabaseReportClient,
  listCurrentStockReport,
} from "@/lib/laundry/services/reports";
import {
  listActiveHospitalUnits,
  listActiveItems,
} from "@/lib/laundry/services/transaction-read-models";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type QueryValue = string | string[] | undefined;

type StokStatusPageProps = {
  searchParams?: Promise<{
    stockItem?: QueryValue;
    stockUnit?: QueryValue;
  }>;
};

function normalizeQueryValue(value: QueryValue) {
  return Array.isArray(value) ? value[0] : value;
}

function buildExportHref(input: { stockItem?: string; stockUnit?: string }) {
  const params = new URLSearchParams();

  if (input.stockItem) {
    params.set("stockItem", input.stockItem);
  }

  if (input.stockUnit) {
    params.set("stockUnit", input.stockUnit);
  }

  const query = params.toString();

  return query
    ? `/laundry/laporan/stok-status/export?${query}`
    : "/laundry/laporan/stok-status/export";
}

export default async function StokStatusPage({
  searchParams,
}: StokStatusPageProps) {
  const params = (await searchParams) ?? {};
  const stockItem = normalizeQueryValue(params.stockItem);
  const stockUnit = normalizeQueryValue(params.stockUnit);

  const supabase = await createServerSupabaseClient();
  const reportClient = createSupabaseReportClient(supabase);

  const [items, hospitalUnits, currentStock] = await Promise.all([
    listActiveItems(supabase),
    listActiveHospitalUnits(supabase),
    listCurrentStockReport(reportClient, {
      itemId: stockItem,
      unitId: stockUnit,
    }),
  ]);
  const exportHref = buildExportHref({
    stockItem,
    stockUnit,
  });
  const activeFilterCount = [stockItem, stockUnit].filter(Boolean).length;
  const positionCount = new Set(
    currentStock.map((row) => row.stockPositionLabel)
  ).size;
  const relatedUnitCount = new Set(
    currentStock
      .map((row) => row.hospitalUnitName)
      .filter((value): value is string => Boolean(value))
  ).size;

  return (
    <section className="shell-surface rounded-[1.9rem] p-6 md:p-8">
      <SectionHeader
        eyebrow="Posisi stok"
        title="Posisi stok"
        description="Lihat stok per posisi dan unit."
      />

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <div className="rounded-[1.4rem] border border-slate-200 bg-white/80 p-4">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Data tampil
          </p>
          <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-slate-950">
            {currentStock.length}
          </p>
        </div>
        <div className="rounded-[1.4rem] border border-slate-200 bg-white/80 p-4">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Posisi aktif
          </p>
          <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-slate-950">
            {positionCount}
          </p>
        </div>
        <div className="rounded-[1.4rem] border border-slate-200 bg-white/80 p-4">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Unit terkait
          </p>
          <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-slate-950">
            {relatedUnitCount}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {activeFilterCount} filter aktif
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

        <form className="mt-5 grid gap-4 md:grid-cols-[1fr_1fr_auto]">
          <FilterField label="Item" htmlFor="stock-item">
            <select
              id="stock-item"
              name="stockItem"
              defaultValue={stockItem ?? ""}
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

          <FilterField label="Unit" htmlFor="stock-unit">
            <select
              id="stock-unit"
              name="stockUnit"
              defaultValue={stockUnit ?? ""}
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
            <ReportActionLink href="/laundry/laporan/stok-status">
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
            Posisi stok
          </h3>
        </div>
        <StockSummaryTable
          caption="Posisi stok"
          rows={currentStock.map((row) => ({
            itemId: row.itemId,
            itemName: row.itemName,
            itemCode: row.itemCode,
            itemType: row.itemType,
            stockPosition: row.stockPosition,
            stockPositionLabel: row.stockPositionLabel,
            quantity: row.quantity,
            hospitalUnitName: row.hospitalUnitName,
          }))}
        />
      </div>
    </section>
  );
}
