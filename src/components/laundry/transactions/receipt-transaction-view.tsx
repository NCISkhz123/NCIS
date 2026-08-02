"use client";

import { useActionState, useState } from "react";
import { SearchableSelect } from "@/components/ui/searchable-select";

import { saveReceiptAction } from "@/app/(protected)/laundry/pemasukan/actions";
import { ShellSectionHeading } from "@/components/layout/shell-section-heading";
import { StockSummaryTable } from "@/components/laundry/transactions/stock-summary-table";
import { TransactionFeedback } from "@/components/laundry/transactions/transaction-feedback";
import { TransactionHistoryTable } from "@/components/laundry/transactions/transaction-history-table";
import {
  initialReceiptFormState,
  type ReceiptFormState,
} from "@/lib/laundry/forms/transactions";
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
  const [selectedItemType, setSelectedItemType] = useState<string>(values.itemType ?? "");

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
      <section className="shell-surface rounded-[1.75rem] p-6 md:p-7 h-full flex flex-col min-h-[400px]">
        <div className="space-y-6 flex-1 flex flex-col">

          <p className="mb-3 text-sm font-semibold text-slate-800">
            Riwayat pemasukan
          </p>
          <div className="flex-1">
            <TransactionHistoryTable
              caption="Riwayat pemasukan"
              rows={recentTransactions}
            />
          </div>
        </div>
      </section>

      <div className="grid gap-6">
        <section className="shell-surface rounded-[1.75rem] p-6">

          <form action={formAction} className="mt-6 grid gap-4">
            <input type="hidden" name="itemType" value={selectedItemType} />
            <div className="grid gap-2">
              <label htmlFor="receipt-item" className="text-sm font-semibold text-slate-700">
                Item Laundry
              </label>
              <SearchableSelect
                id="receipt-item"
                name="itemId"
                defaultValue={values.itemId ?? ""}
                disabled={pending}
                options={items.map((item) => ({
                  value: item.id,
                  label: item.name,
                }))}
                placeholder="Ketik untuk mencari item..."
                onChange={(val) => {
                  const selected = items.find((i) => i.id === val);
                  setSelectedItemType(selected?.item_type ?? "");
                }}
              />
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
      </div>
    </div>
  );
}

