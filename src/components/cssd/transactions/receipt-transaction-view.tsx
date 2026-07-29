"use client";

import { useActionState } from "react";

import {
  initialReceiptFormState,
  type ReceiptFormState,
} from "@/lib/cssd/forms/transactions";
import { saveReceiptAction } from "@/app/(protected)/cssd/pemasukan/actions";
import { StockSummaryTable } from "@/components/cssd/transactions/stock-summary-table";
import { TransactionFeedback } from "@/components/cssd/transactions/transaction-feedback";
import { TransactionHistoryTable } from "@/components/cssd/transactions/transaction-history-table";
import { TransactionPageShell } from "@/components/transactions/transaction-page-shell";
import { TransactionSummaryStrip } from "@/components/transactions/transaction-summary-strip";
import type {
  StockSummaryEntry,
  TransactionHistoryEntry,
} from "@/lib/cssd/services/transaction-read-models";
import type { ItemRow } from "@/lib/cssd/services/master-data";

type ReceiptTransactionViewProps = {
  initialState?: ReceiptFormState;
  items: ItemRow[];
  recentTransactions: TransactionHistoryEntry[];
  stockSummary: StockSummaryEntry[];
};

export function ReceiptTransactionView({
  initialState = initialReceiptFormState,
  items,
  recentTransactions,
  stockSummary,
}: ReceiptTransactionViewProps) {
  const [formState, formAction, pending] = useActionState(
    saveReceiptAction,
    initialState
  );

  const values = formState.values ?? {};
  const defaultDate = new Date().toISOString().slice(0, 10);
  const activeItemLabel = items.length
    ? `${items[0]?.code} - ${items[0]?.name}`
    : "Belum ada item";

  return (
    <TransactionPageShell
      eyebrow="CSSD"
      title="Pemasukan"
      description="Catat barang masuk ke stok CSSD."
      summary={
        <TransactionSummaryStrip
          items={[
            {
              label: "Item aktif",
              value: items.length,
              helper: activeItemLabel,
            },
            {
              label: "Riwayat terbaru",
              value: recentTransactions.length,
              helper: "Transaksi masuk yang sudah tercatat.",
            },
            {
              label: "Stok saat ini",
              value: stockSummary.length,
              helper: "Posisi stok yang bisa dicek sebelum simpan.",
              accent: "emphasis",
            },
          ]}
        />
      }
      formTitle="Catat pemasukan"
      formDescription="Isi item, jenis, tanggal, dan jumlah masuk."
      form={
        <form action={formAction} className="grid gap-4">
            <div className="grid gap-2">
              <label
                htmlFor="receipt-item"
                className="text-sm font-semibold text-slate-700"
              >
                Item CSSD
              </label>
              <select
                id="receipt-item"
                name="itemId"
                defaultValue={values.itemId ?? ""}
                disabled={pending}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
              >
                <option value="">Pilih item</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.code} - {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <label
                htmlFor="receipt-item-type"
                className="text-sm font-semibold text-slate-700"
              >
                Jenis Item
              </label>
              <select
                id="receipt-item-type"
                name="itemType"
                defaultValue={values.itemType ?? "REUSABLE"}
                disabled={pending}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
              >
                <option value="REUSABLE">Reusable</option>
                <option value="CONSUMABLE_DISTRIBUTION">
                  Konsumabel Distribusi
                </option>
                <option value="CONSUMABLE_INTERNAL">Konsumabel Internal</option>
              </select>
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              <div className="grid gap-2">
                <label
                  htmlFor="receipt-date"
                  className="text-sm font-semibold text-slate-700"
                >
                  Tanggal Transaksi
                </label>
                <input
                  id="receipt-date"
                  type="date"
                  name="transactionDate"
                  defaultValue={values.transactionDate ?? defaultDate}
                  disabled={pending}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                />
              </div>

              <div className="grid gap-2">
                <label
                  htmlFor="receipt-quantity"
                  className="text-sm font-semibold text-slate-700"
                >
                  Jumlah Masuk
                </label>
                <input
                  id="receipt-quantity"
                  type="number"
                  min="1"
                  name="quantity"
                  defaultValue={values.quantity ?? ""}
                  disabled={pending}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <label
                htmlFor="receipt-notes"
                className="text-sm font-semibold text-slate-700"
              >
                Catatan
              </label>
              <textarea
                id="receipt-notes"
                name="notes"
                rows={4}
                defaultValue={values.notes ?? ""}
                disabled={pending}
                className="rounded-[1.35rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
              />
            </div>

            <TransactionFeedback
              error={formState.error}
              message={formState.message}
              impact={formState.impact}
            />

            <button
              type="submit"
              disabled={pending}
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "Menyimpan..." : "Simpan Pemasukan"}
            </button>
          </form>
      }
      supportingContent={
        <>
        <section className="shell-surface rounded-[1.75rem] p-6">
          <p className="text-sm font-semibold text-slate-900">Riwayat terbaru</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Tinjau transaksi masuk yang paling baru.
          </p>
          <div className="mt-5">
            <TransactionHistoryTable
              caption="Riwayat terbaru"
              rows={recentTransactions}
            />
          </div>
        </section>

        <section className="shell-surface rounded-[1.75rem] p-6">
          <p className="text-sm font-semibold text-slate-900">Stok saat ini</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Gunakan sebagai acuan sebelum menambah stok.
          </p>
          <div className="mt-5">
            <StockSummaryTable caption="Stok saat ini" rows={stockSummary} />
          </div>
        </section>
        </>
      }
    />
  );
}
