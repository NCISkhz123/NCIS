import type { ReactNode } from "react";

import { DataTable } from "@/components/data/data-table";
import { StockSummaryTable } from "@/components/cssd/transactions/stock-summary-table";
import { TransactionHistoryTable } from "@/components/cssd/transactions/transaction-history-table";
import {
  createSupabaseReportClient,
  listCurrentStockReport,
  listItemStockCardReport,
  listTransactionHistoryReport,
} from "@/lib/cssd/services/reports";
import {
  listActiveHospitalUnits,
  listActiveItems,
} from "@/lib/cssd/services/transaction-read-models";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type LaporanPageProps = {
  searchParams?: Promise<{
    stockItem?: string | string[];
    stockUnit?: string | string[];
    historyItem?: string | string[];
    historyUnit?: string | string[];
    historyFrom?: string | string[];
    historyTo?: string | string[];
    cardItem?: string | string[];
    cardUnit?: string | string[];
    cardFrom?: string | string[];
    cardTo?: string | string[];
  }>;
};

type QueryValue = string | string[] | undefined;

function normalizeQueryValue(value: QueryValue) {
  return Array.isArray(value) ? value[0] : value;
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

function SectionHeader(props: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <>
      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-slate-500">
        {props.eyebrow}
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
        {props.title}
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
        {props.description}
      </p>
    </>
  );
}

function FilterField(props: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <label htmlFor={props.htmlFor} className="text-sm font-semibold text-slate-700">
        {props.label}
      </label>
      {props.children}
    </div>
  );
}

export default async function LaporanPage({ searchParams }: LaporanPageProps) {
  const params = (await searchParams) ?? {};
  const stockItem = normalizeQueryValue(params.stockItem);
  const stockUnit = normalizeQueryValue(params.stockUnit);
  const historyItem = normalizeQueryValue(params.historyItem);
  const historyUnit = normalizeQueryValue(params.historyUnit);
  const historyFrom = normalizeQueryValue(params.historyFrom);
  const historyTo = normalizeQueryValue(params.historyTo);
  const cardItem = normalizeQueryValue(params.cardItem);
  const cardUnit = normalizeQueryValue(params.cardUnit);
  const cardFrom = normalizeQueryValue(params.cardFrom);
  const cardTo = normalizeQueryValue(params.cardTo);

  const supabase = await createServerSupabaseClient();
  const reportClient = createSupabaseReportClient(supabase);

  const [items, hospitalUnits, currentStock, transactionHistory, stockCard] =
    await Promise.all([
      listActiveItems(supabase),
      listActiveHospitalUnits(supabase),
      listCurrentStockReport(reportClient, {
        itemId: stockItem,
        unitId: stockUnit,
        limit: 100,
      }),
      listTransactionHistoryReport(reportClient, {
        itemId: historyItem,
        unitId: historyUnit,
        dateFrom: historyFrom,
        dateTo: historyTo,
        limit: 100,
      }),
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

  return (
    <div className="grid gap-6">
      <section className="shell-surface rounded-[1.9rem] p-6 md:p-8">
        <SectionHeader
          eyebrow="Laporan CSSD"
          title="Pantau stok, alur transaksi, dan kartu stok item"
          description="Halaman ini merangkum posisi stok CSSD saat ini, riwayat transaksi dengan filter tanggal, dan jejak perpindahan satu item secara detail."
        />

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.5rem] border border-slate-200 bg-white/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Posisi Aktif
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-slate-950">
              {currentStock.length}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Baris stok aktif hasil gabungan item, posisi, dan unit.
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-slate-200 bg-white/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Riwayat Tampil
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-slate-950">
              {transactionHistory.length}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Transaksi sesuai filter item, unit, dan tanggal.
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-slate-200 bg-white/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Kartu Stok
            </p>
            <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-slate-950">
              {selectedCardItem
                ? `${selectedCardItem.code} - ${selectedCardItem.name}`
                : "Pilih item"}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Lacak alur masuk, keluar, kembali, dan proses sterilisasi item.
            </p>
          </div>
        </div>
      </section>

      <section id="stok-saat-ini" className="shell-surface rounded-[1.9rem] p-6 md:p-8">
        <SectionHeader
          eyebrow="Stok Saat Ini"
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
              href="/cssd/laporan#stok-saat-ini"
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

      <section
        id="riwayat-transaksi"
        className="shell-surface rounded-[1.9rem] p-6 md:p-8"
      >
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
              href="/cssd/laporan#riwayat-transaksi"
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

      <section id="kartu-stok" className="shell-surface rounded-[1.9rem] p-6 md:p-8">
        <SectionHeader
          eyebrow="Kartu Stok"
          title="Jejak perpindahan satu item"
          description="Pilih satu item untuk melihat alur stok dari pemasukan sampai proses sterilisasi atau distribusi ke unit."
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
            <a
              href="/cssd/laporan#kartu-stok"
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
                : [["-", selectedCardItem ? "Belum ada pergerakan" : "Pilih item", "-", "-", "-", "-"]]
            }
          />
        </div>
      </section>
    </div>
  );
}
