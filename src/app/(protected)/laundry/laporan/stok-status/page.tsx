import { FilterField } from "@/components/laundry/reports/filter-field";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  ReportActionButton,
  ReportActionLink,
} from "@/components/reports/report-action";
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

  // Ensure token is refreshed sequentially before parallel queries
  await supabase.auth.getUser();

  const [items, hospitalUnits, currentStock] = await Promise.all([
    listActiveItems(supabase),
    listActiveHospitalUnits(supabase),
    listCurrentStockReport(reportClient, {
      itemId: stockItem,
      unitId: stockUnit === "INTERNAL" ? null : stockUnit,
    }),
  ]);
  const exportHref = buildExportHref({
    stockItem,
    stockUnit,
  });


  return (
    <section className="shell-surface rounded-[1.9rem] p-6 md:p-8">
      <div className="rounded-[1.6rem] border border-slate-200 bg-slate-50/80 p-5">


        <form className="mt-5 grid gap-4 md:grid-cols-[1fr_1fr_auto]">
          <FilterField label="Item" htmlFor="stock-item">
            <SearchableSelect
              id="stock-item"
              name="stockItem"
              defaultValue={stockItem ?? ""}
              options={items.map((item) => ({
                value: item.id,
                label: item.name,
              }))}
              placeholder="Semua item"
            />
          </FilterField>

          <FilterField label="Unit" htmlFor="stock-unit">
            <select
              id="stock-unit"
              name="stockUnit"
              defaultValue={stockUnit ?? ""}
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

          <div className="flex flex-wrap items-end gap-3">
            <ReportActionButton type="submit" variant="primary">
              Terapkan
            </ReportActionButton>
            <ReportActionLink href={exportHref} variant="export">
              Ekspor Excel
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
          isGrouped={!stockUnit}
          rows={currentStock.map((row) => ({
            itemId: row.itemId,
            itemName: row.itemName,
            itemCode: row.itemCode,
            itemType: row.itemType,
            stockPosition: row.stockPosition,
            stockPositionLabel: row.stockPositionLabel,
            quantity: row.quantity,
            hospitalUnitId: row.hospitalUnitId,
            hospitalUnitName: row.hospitalUnitName,
          }))}
        />
      </div>
    </section>
  );
}
