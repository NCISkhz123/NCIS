import { FilterField } from "@/components/cssd/reports/filter-field";
import { SectionHeader } from "@/components/cssd/reports/section-header";
import { StockSummaryTable } from "@/components/cssd/transactions/stock-summary-table";
import {
  createSupabaseReportClient,
  listCurrentStockReport,
} from "@/lib/cssd/services/reports";
import {
  listActiveHospitalUnits,
  listActiveItems,
} from "@/lib/cssd/services/transaction-read-models";
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
      limit: 100,
    }),
  ]);

  return (
    <section className="shell-surface rounded-[1.9rem] p-6 md:p-8">
      <SectionHeader
        eyebrow="Stok Status"
        title="Snapshot stok per posisi"
        description="Gunakan filter item atau unit untuk mempersempit tampilan saldo aktif CSSD."
      />

      <form className="mt-6 grid gap-4 md:grid-cols-[1fr_1fr_auto]">
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

        <div className="flex items-end gap-3">
          <button
            type="submit"
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Terapkan
          </button>
          <a
            href="/cssd/laporan/stok-status"
            className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
          >
            Reset
          </a>
        </div>
      </form>

      <div className="mt-6">
        <StockSummaryTable
          caption="Stok aktif CSSD"
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
