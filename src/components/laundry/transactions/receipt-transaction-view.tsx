"use client";

import { useActionState } from "react";

import {
  initialReceiptFormState,
  saveReceiptAction,
  type ReceiptFormState,
} from "@/app/(protected)/laundry/pemasukan/actions";
import { StockSummaryTable } from "@/components/laundry/transactions/stock-summary-table";
import { TransactionFeedback } from "@/components/laundry/transactions/transaction-feedback";
import { TransactionHistoryTable } from "@/components/laundry/transactions/transaction-history-table";
import type {
  StockSummaryEntry,
  TransactionHistoryEntry,
} from "@/lib/laundry/services/transaction-read-models";
import type { ItemRow } from "@/lib/laundry/services/master-data";

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

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
      <section className="shell-surface rounded-[1.75rem] p-6">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-slate-500">
          Transaksi Laundry
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
          Kelola Pemasukan Stok Laundry
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
          Catat barang masuk agar stok siap pakai langsung bertambah dan tercatat
          pada riwayat pergerakan stok.
        </p>

        <div className="mt-6">
          <p className="mb-3 text-sm font-semibold text-slate-800">
            Riwayat pemasukan terbaru
          </p>
          <TransactionHistoryTable
            caption="Riwayat pemasukan terbaru"
            rows={recentTransactions}
          />
        </div>
      </section>

      <div className="grid gap-6">
        <section className="shell-surface rounded-[1.75rem] p-6">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-slate-500">
            Form Pemasukan
          </p>
          <h3 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-slate-950">
            Tambah stok masuk
          </h3>
          <form action={formAction} className="mt-6 grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="receipt-item" className="text-sm font-semibold text-slate-700">
                Item Laundry
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
              <label htmlFor="receipt-notes" className="text-sm font-semibold text-slate-700">
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
        </section>

        <section className="shell-surface rounded-[1.75rem] p-6">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-slate-500">
            Detail Stok
          </p>
          <h3 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-slate-950">
            Posisi stok saat ini
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Snapshot cepat untuk melihat item mana yang paling banyak tersedia
            di Laundry.
          </p>

          <div className="mt-5">
            <StockSummaryTable caption="Posisi stok saat ini" rows={stockSummary} />
          </div>
        </section>
      </div>
    </div>
  );
}

