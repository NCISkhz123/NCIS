import { DataTable } from "@/components/data/data-table";
import { FilterField } from "@/components/laundry/reports/filter-field";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { SectionHeader } from "@/components/laundry/reports/section-header";
import {
  ReportActionButton,
  ReportActionLink,
} from "@/components/reports/report-action";
import {
  createSupabaseReportClient,
  listItemStockCardReport,
} from "@/lib/laundry/services/reports";
import {
  listActiveHospitalUnits,
  listActiveItems,
} from "@/lib/laundry/services/transaction-read-models";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type QueryValue = string | string[] | undefined;

type KartuStokPageProps = {
  searchParams?: Promise<{
    cardItem?: QueryValue;
    cardUnit?: QueryValue;
    cardFrom?: QueryValue;
    cardTo?: QueryValue;
  }>;
};

function normalizeQueryValue(value: QueryValue) {
  return Array.isArray(value) ? value[0] : value;
}

function buildExportHref(input: {
  cardItem?: string;
  cardUnit?: string;
  cardFrom?: string;
  cardTo?: string;
}) {
  const params = new URLSearchParams();

  if (input.cardItem) {
    params.set("cardItem", input.cardItem);
  }

  if (input.cardUnit) {
    params.set("cardUnit", input.cardUnit);
  }

  if (input.cardFrom) {
    params.set("cardFrom", input.cardFrom);
  }

  if (input.cardTo) {
    params.set("cardTo", input.cardTo);
  }

  const query = params.toString();

  return query
    ? `/laundry/laporan/kartu-stok/export?${query}`
    : "/laundry/laporan/kartu-stok/export";
}

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

function buildPeriodLabel(from?: string, to?: string) {
  const fromLabel = from ? formatDateLabel(from) : null;
  const toLabel = to ? formatDateLabel(to) : null;

  if (!fromLabel && !toLabel) {
    return "Semua tanggal";
  }

  return `${fromLabel ?? "Awal"} - ${toLabel ?? "Sekarang"}`;
}

export default async function KartuStokPage({
  searchParams,
}: KartuStokPageProps) {
  const params = (await searchParams) ?? {};
  const cardItem = normalizeQueryValue(params.cardItem);
  const cardUnit = normalizeQueryValue(params.cardUnit);
  const cardFrom = normalizeQueryValue(params.cardFrom);
  const cardTo = normalizeQueryValue(params.cardTo);

  const supabase = await createServerSupabaseClient();
  const reportClient = createSupabaseReportClient(supabase);

  const [items, hospitalUnits, stockCard] = await Promise.all([
    listActiveItems(supabase),
    listActiveHospitalUnits(supabase),
    listItemStockCardReport(reportClient, {
      itemId: cardItem,
      unitId: cardUnit === "INTERNAL" ? null : cardUnit,
      dateFrom: cardFrom,
      dateTo: cardTo,
    }),
  ]);

  const selectedCardItem = cardItem
    ? items.find((item) => item.id === cardItem) ?? null
    : null;
  const exportHref = buildExportHref({
    cardItem,
    cardUnit,
    cardFrom,
    cardTo,
  });
  const periodLabel = buildPeriodLabel(cardFrom, cardTo);
  const activeFilterCount = [
    cardItem,
    cardUnit,
    cardFrom,
    cardTo,
  ].filter(Boolean).length;

  return (
    <section className="shell-surface rounded-[1.9rem] p-6 md:p-8">
      <SectionHeader
        eyebrow="Kartu Stok"
        title="Kartu stok item"
        description="Telusuri pergerakan satu item."
      />

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <div className="rounded-[1.4rem] border border-slate-200 bg-white/80 p-4">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Item dipilih
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-950">
            {selectedCardItem
              ? `${selectedCardItem.code} - ${selectedCardItem.name}`
              : "Pilih item dahulu"}
          </p>
        </div>
        <div className="rounded-[1.4rem] border border-slate-200 bg-white/80 p-4">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Pergerakan
          </p>
          <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-slate-950">
            {stockCard.length}
          </p>
        </div>
        <div className="rounded-[1.4rem] border border-slate-200 bg-white/80 p-4">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Periode
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-950">
            {periodLabel}
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
            Pilih item lalu tampilkan hasil.
          </p>
        </div>

        <form className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-[1.2fr_1fr_0.9fr_0.9fr_auto]">
          <FilterField label="Item" htmlFor="card-item">
            <SearchableSelect
              id="card-item"
              name="cardItem"
              defaultValue={cardItem ?? ""}
              options={items.map((item) => ({
                value: item.id,
                label: item.name,
              }))}
              placeholder="Pilih item untuk kartu stok"
            />
          </FilterField>

          <FilterField label="Unit" htmlFor="card-unit">
            <select
              id="card-unit"
              name="cardUnit"
              defaultValue={cardUnit ?? ""}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
            >
              <option value="">Semua unit terkait</option>
              <option value="INTERNAL">Laundry</option>
              {hospitalUnits.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name} ({unit.code})
                </option>
              ))}
            </select>
          </FilterField>

          <FilterField label="Dari tanggal" htmlFor="card-from">
            <input
              id="card-from"
              type="date"
              name="cardFrom"
              defaultValue={cardFrom ?? ""}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
            />
          </FilterField>

          <FilterField label="Sampai tanggal" htmlFor="card-to">
            <input
              id="card-to"
              type="date"
              name="cardTo"
              defaultValue={cardTo ?? ""}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
            />
          </FilterField>

          <div className="flex flex-wrap items-end gap-3">
            <button
              type="submit"
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Tampilkan
            </button>
            {selectedCardItem ? (
              <ReportActionLink href={exportHref} variant="export">
                Ekspor CSV
              </ReportActionLink>
            ) : (
              <ReportActionButton type="button" disabled variant="disabled">
                Ekspor CSV
              </ReportActionButton>
            )}
            <ReportActionLink href="/laundry/laporan/kartu-stok">
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
            Pergerakan item
          </h3>
        </div>
        <DataTable
          caption={
            selectedCardItem
              ? `Kartu stok ${selectedCardItem.code} - ${selectedCardItem.name}`
              : "Pilih item untuk melihat pergerakan"
          }
          columns={["Tanggal", "Transaksi", "Alur", "Unit", "Qty"]}
          rows={
            stockCard.length
              ? stockCard.map((row) => [
                  formatDateLabel(row.transactionDate),
                  row.movementTypeLabel,
                  row.flowLabel,
                  row.hospitalUnitName ?? "-",
                  <span
                    key={`${row.movementId}-qty`}
                    className="font-mono tabular-nums text-slate-900"
                  >
                    {row.quantity}
                  </span>,
                ])
              : [[
                  "-",
                  selectedCardItem ? "Belum ada pergerakan" : "Pilih item",
                  "-",
                  "-",
                  "-",
                ]]
          }
        />
      </div>
    </section>
  );
}
