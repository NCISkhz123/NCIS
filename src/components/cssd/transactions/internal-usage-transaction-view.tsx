"use client";

import { useActionState } from "react";

import {
  initialInternalUsageFormState,
  type InternalUsageFormState,
} from "@/lib/cssd/forms/transactions";
import { saveInternalUsageAction } from "@/app/(protected)/cssd/pemakaian-internal/actions";
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
  const firstInternalItem = internalItems[0]
    ? `${internalItems[0].code} - ${internalItems[0].name}`
    : "Belum ada item internal";

  return (
    <TransactionPageShell
      eyebrow="CSSD"
      title="Pemakaian internal"
      description="Catat konsumabel yang dipakai di CSSD."
      summary={
        <TransactionSummaryStrip
          items={[
            {
              label: "Item internal aktif",
              value: internalItems.length,
              helper: firstInternalItem,
            },
            {
              label: "Riwayat terbaru",
              value: recentTransactions.length,
              helper: "Pemakaian internal yang sudah tercatat.",
            },
            {
              label: "Sisa stok",
              value: stockSummary.length,
              helper: "Cek stok sebelum dipakai.",
              accent: "emphasis",
            },
          ]}
        />
      }
      formTitle="Catat pemakaian"
      formDescription="Pilih item, isi tanggal, jumlah pakai, lalu simpan."
      form={
        <form action={formAction} className="grid gap-4">
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
      }
      supportingContent={
        <>
        <section className="shell-surface rounded-[1.75rem] p-6">
          <p className="text-sm font-semibold text-slate-900">Riwayat terbaru</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Tinjau pemakaian internal yang baru tercatat.
          </p>
          <div className="mt-5">
            <TransactionHistoryTable
              caption="Riwayat terbaru"
              rows={recentTransactions}
            />
          </div>
        </section>

        <section className="shell-surface rounded-[1.75rem] p-6">
          <p className="text-sm font-semibold text-slate-900">Sisa stok</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Pantau stok konsumabel internal yang masih tersedia.
          </p>
          <div className="mt-5">
            <StockSummaryTable caption="Sisa stok" rows={stockSummary} />
          </div>
        </section>
        </>
      }
    />
  );
}
