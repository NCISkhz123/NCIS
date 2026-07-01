import { DataTable } from "@/components/data/data-table";
import { FilterField } from "@/components/laundry/reports/filter-field";
import { SectionHeader } from "@/components/laundry/reports/section-header";
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
      unitId: cardUnit,
      dateFrom: cardFrom,
      dateTo: cardTo,
      limit: 100,
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

  return (
    <section className="shell-surface rounded-[1.9rem] p-6 md:p-8">
      <SectionHeader
        eyebrow="Kartu Stok"
        title="Jejak perpindahan satu item"
        description="Pilih satu item untuk melihat alur stok dari pemasukan sampai proses pencucian atau distribusi ke unit."
      />

      <form className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-[1.2fr_1fr_0.9fr_0.9fr_auto]">
        <FilterField label="Item" htmlFor="card-item">
          <select
            id="card-item"
            name="cardItem"
            defaultValue={cardItem ?? ""}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
          >
            <option value="">Pilih item untuk kartu stok</option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.code} - {item.name}
              </option>
            ))}
          </select>
        </FilterField>

        <FilterField label="Unit" htmlFor="card-unit">
          <select
            id="card-unit"
            name="cardUnit"
            defaultValue={cardUnit ?? ""}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
          >
            <option value="">Semua unit terkait</option>
            {hospitalUnits.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name} ({unit.code})
              </option>
            ))}
          </select>
        </FilterField>

        <FilterField label="Dari Tanggal" htmlFor="card-from">
          <input
            id="card-from"
            type="date"
            name="cardFrom"
            defaultValue={cardFrom ?? ""}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
          />
        </FilterField>

        <FilterField label="Sampai Tanggal" htmlFor="card-to">
          <input
            id="card-to"
            type="date"
            name="cardTo"
            defaultValue={cardTo ?? ""}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
          />
        </FilterField>

        <div className="flex items-end gap-3">
          <button
            type="submit"
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Tampilkan
          </button>
          {selectedCardItem ? (
            <a
              href={exportHref}
              className="rounded-full border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 hover:text-emerald-900"
            >
              Export CSV
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="rounded-full border border-slate-200 bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-400"
            >
              Export CSV
            </button>
          )}
          <a
            href="/laundry/laporan/kartu-stok"
            className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
          >
            Reset
          </a>
        </div>
      </form>

      <div className="mt-6">
        <DataTable
          caption={
            selectedCardItem
              ? `Kartu stok ${selectedCardItem.code} - ${selectedCardItem.name}`
              : "Pilih item untuk menampilkan kartu stok"
          }
          columns={["Tanggal", "Transaksi", "Alur", "Unit", "Qty", "Catatan"]}
          rows={
            stockCard.length
              ? stockCard.map((row) => [
                  formatDateLabel(row.transactionDate),
                  row.movementTypeLabel,
                  row.flowLabel,
                  row.hospitalUnitName ?? "-",
                  row.quantity,
                  row.notes ?? "-",
                ])
              : [[
                  "-",
                  selectedCardItem ? "Belum ada pergerakan" : "Pilih item",
                  "-",
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

