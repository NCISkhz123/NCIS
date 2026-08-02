"use client";

import { useActionState } from "react";
import { SearchableSelect } from "@/components/ui/searchable-select";

import { saveDistributionAction } from "@/app/(protected)/laundry/distribusi/actions";
import { ShellSectionHeading } from "@/components/layout/shell-section-heading";
import { StockSummaryTable } from "@/components/laundry/transactions/stock-summary-table";
import { TransactionFeedback } from "@/components/laundry/transactions/transaction-feedback";
import { TransactionHistoryTable } from "@/components/laundry/transactions/transaction-history-table";
import {
  initialDistributionFormState,
  type DistributionFormState,
} from "@/lib/laundry/forms/transactions";
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
      <section className="shell-surface rounded-[1.75rem] p-6 md:p-7 h-full flex flex-col min-h-[400px]">
        <div className="space-y-6 flex-1 flex flex-col">

          <p className="mb-3 text-sm font-semibold text-slate-800">
            Riwayat distribusi
          </p>
          <div className="flex-1">
            <TransactionHistoryTable
              caption="Riwayat distribusi"
              rows={recentTransactions}
            />
          </div>
        </div>
      </section>

      <div className="grid gap-6">
        <section className="shell-surface rounded-[1.75rem] p-6">


          <form action={formAction} className="mt-6 grid gap-4">
            <div className="grid gap-2">
              <label
                htmlFor="distribution-item"
                className="text-sm font-semibold text-slate-700"
              >
                Item Laundry
              </label>
              <SearchableSelect
                id="distribution-item"
                name="itemId"
                defaultValue={values.itemId ?? ""}
                disabled={pending}
                options={items.map((item) => ({
                  value: item.id,
                  label: item.name,
                }))}
                placeholder="Ketik untuk mencari item..."
              />
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
                <option value="CONSUMABLE">Consumable</option>
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
      </div>
    </div>
  );
}

