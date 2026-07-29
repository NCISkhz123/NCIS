"use client";

import { useActionState } from "react";

import { saveInternalUsageAction } from "@/app/(protected)/laundry/pemakaian-internal/actions";
import { ShellSectionHeading } from "@/components/layout/shell-section-heading";
import { StockSummaryTable } from "@/components/laundry/transactions/stock-summary-table";
import { TransactionFeedback } from "@/components/laundry/transactions/transaction-feedback";
import { TransactionHistoryTable } from "@/components/laundry/transactions/transaction-history-table";
import {
  initialInternalUsageFormState,
  type InternalUsageFormState,
} from "@/lib/laundry/forms/transactions";
import type {
  StockSummaryEntry,
  TransactionHistoryEntry,
} from "@/lib/laundry/services/transaction-read-models";
import type { ItemRow } from "@/lib/laundry/services/master-data";

type InternalUsageTransactionViewProps = {
  initialState?: InternalUsageFormState;
  items: ItemRow[];
  recentTransactions: TransactionHistoryEntry[];
  stockSummary: StockSummaryEntry[];
};

export function InternalUsageTransactionView({
  initialState = initialInternalUsageFormState,
  items,
  recentTransactions,
  stockSummary,
}: InternalUsageTransactionViewProps) {
  const [formState, formAction, pending] = useActionState(
    saveInternalUsageAction,
    initialState
  );

  const values = formState.values ?? {};
  const defaultDate = new Date().toISOString().slice(0, 10);
  const internalItems = items.filter(
    (item) => item.item_type === "CONSUMABLE_INTERNAL"
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
      <section className="shell-surface rounded-[1.75rem] p-6 md:p-7">
        <div className="space-y-6">
          <ShellSectionHeading
            eyebrow="Laundry"
            title="Pemakaian internal"
            description="Catat konsumabel yang dipakai di Laundry."
            size="hero"
          />
          <p className="mb-3 text-sm font-semibold text-slate-800">
            Riwayat pemakaian
          </p>
          <TransactionHistoryTable
            caption="Riwayat pemakaian"
            rows={recentTransactions}
          />
        </div>
      </section>

      <div className="grid gap-6">
        <section className="shell-surface rounded-[1.75rem] p-6">
          <ShellSectionHeading
            eyebrow="Input"
            title="Catat pemakaian"
            description="Pilih item lalu isi jumlah yang dipakai."
          />

          <form action={formAction} className="mt-6 grid gap-4">
            <div className="grid gap-2">
              <label
                htmlFor="internal-item"
                className="text-sm font-semibold text-slate-700"
              >
                Item Konsumabel Internal
              </label>
              <select
                id="internal-item"
                name="itemId"
                defaultValue={values.itemId ?? ""}
                disabled={pending}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
              >
                <option value="">Pilih item</option>
                {internalItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.code} - {item.name}
                  </option>
                ))}
              </select>
            </div>

            <input type="hidden" name="itemType" value="CONSUMABLE_INTERNAL" />

            <div className="grid gap-2 md:grid-cols-2">
              <div className="grid gap-2">
                <label
                  htmlFor="internal-date"
                  className="text-sm font-semibold text-slate-700"
                >
                  Tanggal Transaksi
                </label>
                <input
                  id="internal-date"
                  type="date"
                  name="transactionDate"
                  defaultValue={values.transactionDate ?? defaultDate}
                  disabled={pending}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                />
              </div>

              <div className="grid gap-2">
                <label
                  htmlFor="internal-quantity"
                  className="text-sm font-semibold text-slate-700"
                >
                  Jumlah Pakai
                </label>
                <input
                  id="internal-quantity"
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
                htmlFor="internal-notes"
                className="text-sm font-semibold text-slate-700"
              >
                Catatan
              </label>
              <textarea
                id="internal-notes"
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
              {pending ? "Menyimpan..." : "Simpan Pemakaian Internal"}
            </button>
          </form>
        </section>

        <section className="shell-surface rounded-[1.75rem] p-6">
          <ShellSectionHeading
            eyebrow="Posisi stok"
            title="Sisa konsumabel"
            description="Pantau stok konsumabel internal yang masih tersedia."
          />

          <div className="mt-5">
            <StockSummaryTable
              caption="Sisa konsumabel"
              rows={stockSummary}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

