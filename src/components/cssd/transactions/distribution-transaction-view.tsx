"use client";

import { useActionState } from "react";

import {
  initialDistributionFormState,
  type DistributionFormState,
} from "@/lib/cssd/forms/transactions";
import { saveDistributionAction } from "@/app/(protected)/cssd/distribusi/actions";
import { StockSummaryTable } from "@/components/cssd/transactions/stock-summary-table";
import { TransactionFeedback } from "@/components/cssd/transactions/transaction-feedback";
import { TransactionHistoryTable } from "@/components/cssd/transactions/transaction-history-table";
import { TransactionPageShell } from "@/components/transactions/transaction-page-shell";
import { TransactionSummaryStrip } from "@/components/transactions/transaction-summary-strip";
import type {
  StockSummaryEntry,
  TransactionHistoryEntry,
} from "@/lib/cssd/services/transaction-read-models";
import type {
  HospitalUnitRow,
  ItemRow,
} from "@/lib/cssd/services/master-data";

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
  const firstUnitLabel = hospitalUnits.length
    ? `${hospitalUnits[0]?.name} (${hospitalUnits[0]?.code})`
    : "Belum ada unit";

  return (
    <TransactionPageShell
      eyebrow="CSSD"
      title="Distribusi"
      description="Catat barang keluar dari CSSD ke unit."
      summary={
        <TransactionSummaryStrip
          items={[
            {
              label: "Unit tujuan aktif",
              value: hospitalUnits.length,
              helper: firstUnitLabel,
            },
            {
              label: "Riwayat terbaru",
              value: recentTransactions.length,
              helper: "Distribusi yang sudah tercatat.",
            },
            {
              label: "Stok siap kirim",
              value: stockSummary.length,
              helper: "Cek stok sebelum barang keluar.",
              accent: "emphasis",
            },
          ]}
        />
      }
      formTitle="Catat distribusi"
      formDescription="Pilih item, unit tujuan, tanggal, dan jumlah distribusi."
      form={
        <form action={formAction} className="grid gap-4">
            <div className="grid gap-2">
              <label
                htmlFor="distribution-item"
                className="text-sm font-semibold text-slate-700"
              >
                Item CSSD
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
      }
      supportingContent={
        <>
        <section className="shell-surface rounded-[1.75rem] p-6">
          <p className="text-sm font-semibold text-slate-900">Riwayat terbaru</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Tinjau distribusi yang baru dikirim ke unit.
          </p>
          <div className="mt-5">
            <TransactionHistoryTable
              caption="Riwayat terbaru"
              rows={recentTransactions}
            />
          </div>
        </section>

        <section className="shell-surface rounded-[1.75rem] p-6">
          <p className="text-sm font-semibold text-slate-900">Stok siap kirim</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Gunakan sebagai acuan sebelum barang dikirim.
          </p>
          <div className="mt-5">
            <StockSummaryTable
              caption="Stok siap kirim"
              rows={stockSummary}
            />
          </div>
        </section>
        </>
      }
    />
  );
}
