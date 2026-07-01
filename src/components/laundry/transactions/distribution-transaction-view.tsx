"use client";

import { useActionState } from "react";

import {
  initialDistributionFormState,
  saveDistributionAction,
  type DistributionFormState,
} from "@/app/(protected)/laundry/distribusi/actions";
import { StockSummaryTable } from "@/components/laundry/transactions/stock-summary-table";
import { TransactionFeedback } from "@/components/laundry/transactions/transaction-feedback";
import { TransactionHistoryTable } from "@/components/laundry/transactions/transaction-history-table";
import type {
  StockSummaryEntry,
  TransactionHistoryEntry,
} from "@/lib/laundry/services/transaction-read-models";
import type {
  HospitalUnitRow,
  ItemRow,
} from "@/lib/laundry/services/master-data";

type DistributionTransactionViewProps = {
  initialState?: DistributionFormState;
  items: ItemRow[];
  hospitalUnits: HospitalUnitRow[];
  recentTransactions: TransactionHistoryEntry[];
  stockSummary: StockSummaryEntry[];
};

export function DistributionTransactionView({
  initialState = initialDistributionFormState,
  items,
  hospitalUnits,
  recentTransactions,
  stockSummary,
}: DistributionTransactionViewProps) {
  const [formState, formAction, pending] = useActionState(
    saveDistributionAction,
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
          Kelola Distribusi Laundry
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
          Distribusi reusable akan berpindah ke stok unit, sedangkan
          konsumabel distribusi akan mengurangi stok siap pakai Laundry.
        </p>

        <div className="mt-6">
          <p className="mb-3 text-sm font-semibold text-slate-800">
            Riwayat distribusi terbaru
          </p>
          <TransactionHistoryTable
            caption="Riwayat distribusi terbaru"
            rows={recentTransactions}
          />
        </div>
      </section>

      <div className="grid gap-6">
        <section className="shell-surface rounded-[1.75rem] p-6">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-slate-500">
            Form Distribusi
          </p>
          <h3 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-slate-950">
            Catat distribusi ke unit
          </h3>

          <form action={formAction} className="mt-6 grid gap-4">
            <div className="grid gap-2">
              <label
                htmlFor="distribution-item"
                className="text-sm font-semibold text-slate-700"
              >
                Item Laundry
              </label>
              <select
                id="distribution-item"
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
                htmlFor="distribution-item-type"
                className="text-sm font-semibold text-slate-700"
              >
                Jenis Item
              </label>
              <select
                id="distribution-item-type"
                name="itemType"
                defaultValue={values.itemType ?? "REUSABLE"}
                disabled={pending}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
              >
                <option value="REUSABLE">Reusable</option>
                <option value="CONSUMABLE_DISTRIBUTION">
                  Konsumabel Distribusi
                </option>
              </select>
            </div>

            <div className="grid gap-2">
              <label
                htmlFor="distribution-unit"
                className="text-sm font-semibold text-slate-700"
              >
                Unit Tujuan
              </label>
              <select
                id="distribution-unit"
                name="targetUnitId"
                defaultValue={values.targetUnitId ?? ""}
                disabled={pending}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
              >
                <option value="">Pilih unit tujuan</option>
                {hospitalUnits.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name} ({unit.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              <div className="grid gap-2">
                <label
                  htmlFor="distribution-date"
                  className="text-sm font-semibold text-slate-700"
                >
                  Tanggal Transaksi
                </label>
                <input
                  id="distribution-date"
                  type="date"
                  name="transactionDate"
                  defaultValue={values.transactionDate ?? defaultDate}
                  disabled={pending}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                />
              </div>

              <div className="grid gap-2">
                <label
                  htmlFor="distribution-quantity"
                  className="text-sm font-semibold text-slate-700"
                >
                  Jumlah Distribusi
                </label>
                <input
                  id="distribution-quantity"
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
                htmlFor="distribution-notes"
                className="text-sm font-semibold text-slate-700"
              >
                Catatan
              </label>
              <textarea
                id="distribution-notes"
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
              {pending ? "Menyimpan..." : "Simpan Distribusi"}
            </button>
          </form>
        </section>

        <section className="shell-surface rounded-[1.75rem] p-6">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-slate-500">
            Ketersediaan
          </p>
          <h3 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-slate-950">
            Stok siap distribusi
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Gunakan daftar ini untuk memastikan jumlah distribusi tidak melebihi
            stok siap pakai yang tersedia di Laundry.
          </p>

          <div className="mt-5">
            <StockSummaryTable
              caption="Stok siap distribusi"
              rows={stockSummary}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

