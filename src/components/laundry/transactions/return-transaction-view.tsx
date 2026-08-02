"use client";

import { useActionState, useState } from "react";
import { SearchableSelect } from "@/components/ui/searchable-select";

import {
  processReusableAction,
  saveReturnAction,
} from "@/app/(protected)/laundry/pengembalian/actions";
import { ShellSectionHeading } from "@/components/layout/shell-section-heading";
import { StockSummaryTable } from "@/components/laundry/transactions/stock-summary-table";
import { TransactionFeedback } from "@/components/laundry/transactions/transaction-feedback";
import { TransactionHistoryTable } from "@/components/laundry/transactions/transaction-history-table";
import {
  RETURN_DESTINATION_POSITIONS,
  STOCK_POSITION_LABELS,
} from "@/lib/laundry/constants";
import {
  initialReturnFormState,
  initialReusableProcessingFormState,
  type ReturnFormState,
  type ReusableProcessingFormState,
} from "@/lib/laundry/forms/transactions";
import type {
  ReusableProcessingSummaryEntry,
  StockSummaryEntry,
  TransactionHistoryEntry,
} from "@/lib/laundry/services/transaction-read-models";
import type {
  HospitalUnitRow,
  ItemRow,
} from "@/lib/laundry/services/master-data";

type ReturnTransactionViewProps = {
  initialState?: ReturnFormState;
  initialProcessingState?: ReusableProcessingFormState;
  items: ItemRow[];
  hospitalUnits: HospitalUnitRow[];
  recentTransactions: TransactionHistoryEntry[];
  stockSummary: StockSummaryEntry[];
  reusableProcessingSummary: ReusableProcessingSummaryEntry[];
};

export function ReturnTransactionView({
  initialState = initialReturnFormState,
  initialProcessingState = initialReusableProcessingFormState,
  items,
  hospitalUnits,
  recentTransactions,
  stockSummary,
  reusableProcessingSummary,
}: ReturnTransactionViewProps) {
  const [returnState, returnAction, returnPending] = useActionState(
    saveReturnAction,
    initialState
  );
  const [processingState, processingAction, processingPending] = useActionState(
    processReusableAction,
    initialProcessingState
  );

  const values = returnState.values ?? {};
  const [selectedUnitId, setSelectedUnitId] = useState<string>(
    (values.sourceUnitId as string) ?? ""
  );

  const itemsInSelectedUnit = new Set(
    stockSummary
      .filter(
        (stock) =>
          stock.hospitalUnitId === selectedUnitId &&
          stock.stockPosition === "IN_UNIT"
      )
      .map((stock) => stock.itemId)
  );

  const reusableItems = items.filter(
    (item) =>
      item.item_type === "REUSABLE" &&
      (selectedUnitId ? itemsInSelectedUnit.has(item.id) : false)
  );
  const defaultDate = new Date().toISOString().slice(0, 10);

  return (
    <div className="grid gap-6 2xl:grid-cols-[1.08fr_.92fr]">
      <div className="grid gap-6 h-full flex flex-col">
        <section className="shell-surface rounded-[1.75rem] p-6 md:p-7 flex-1 flex flex-col min-h-[400px]">
          <div className="space-y-6 flex-1 flex flex-col">
            <p className="mb-3 text-sm font-semibold text-slate-800">
              Riwayat pengembalian
            </p>
            <div className="flex-1">
              <TransactionHistoryTable
                caption="Riwayat pengembalian"
                rows={recentTransactions}
              />
            </div>
          </div>
        </section>
      </div>

      <div className="grid gap-6">
        <section className="shell-surface rounded-[1.75rem] p-6">
          <form action={returnAction} className="mt-6 grid gap-4">
            <div className="grid gap-2">
              <label
                htmlFor="return-source-unit"
                className="text-sm font-semibold text-slate-700"
              >
                Unit Asal
              </label>
              <select
                id="return-source-unit"
                name="sourceUnitId"
                value={selectedUnitId}
                onChange={(e) => setSelectedUnitId(e.target.value)}
                disabled={returnPending}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
              >
                <option value="">Pilih unit asal</option>
                {hospitalUnits.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name} ({unit.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <label
                htmlFor="return-item"
                className="text-sm font-semibold text-slate-700"
              >
                Item Reusable
              </label>
              <SearchableSelect
                key={selectedUnitId}
                id="return-item"
                name="itemId"
                defaultValue={values.itemId ?? ""}
                disabled={returnPending || !selectedUnitId}
                options={reusableItems.map((item) => ({
                  value: item.id,
                  label: item.name,
                }))}
                placeholder="Ketik untuk mencari item..."
              />
            </div>

            <input type="hidden" name="itemType" value="REUSABLE" />

            <div className="grid gap-2 md:grid-cols-2">
              <div className="grid gap-2">
                <label
                  htmlFor="return-date"
                  className="text-sm font-semibold text-slate-700"
                >
                  Tanggal Transaksi
                </label>
                <input
                  id="return-date"
                  type="date"
                  name="transactionDate"
                  defaultValue={values.transactionDate ?? defaultDate}
                  disabled={returnPending}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                />
              </div>

              <div className="grid gap-2">
                <label
                  htmlFor="return-quantity"
                  className="text-sm font-semibold text-slate-700"
                >
                  Jumlah Kembali
                </label>
                <input
                  id="return-quantity"
                  type="number"
                  min="1"
                  name="quantity"
                  defaultValue={values.quantity ?? ""}
                  disabled={returnPending}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <label
                htmlFor="return-destination"
                className="text-sm font-semibold text-slate-700"
              >
                Tujuan Pengembalian
              </label>
              <select
                id="return-destination"
                name="destinationPosition"
                defaultValue={values.destinationPosition ?? RETURN_DESTINATION_POSITIONS[0]}
                disabled={returnPending}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
              >
                {RETURN_DESTINATION_POSITIONS.map((position) => (
                  <option key={position} value={position}>
                    {STOCK_POSITION_LABELS[position]}
                  </option>
                ))}
              </select>
            </div>


            <TransactionFeedback
              error={returnState.error}
              message={returnState.message}
              impact={returnState.impact}
            />

            <button
              type="submit"
              disabled={returnPending}
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {returnPending ? "Menyimpan..." : "Simpan Pengembalian"}
            </button>
          </form>
        </section>

        <section className="shell-surface rounded-[1.75rem] p-6">
          <div className="mt-5">
            <TransactionFeedback
              error={processingState.error}
              message={processingState.message}
              impact={processingState.impact}
            />
          </div>

          <div className="mt-5 grid gap-4">
            {reusableProcessingSummary.length ? (
              reusableProcessingSummary.map((row) => (
                <article
                  key={row.itemId}
                  className="rounded-[1.35rem] border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {row.itemCode} - {row.itemName}
                      </p>
                      <p className="mt-2 text-xs uppercase tracking-[0.24em] text-slate-500">
                        Kotor {row.availableNonSterile} | Area Pencucian{" "}
                        {row.availableSterilizationArea} | Rusak {row.availableDamaged}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <form action={processingAction} className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-800">
                        Dari Kotor
                      </p>
                      <input type="hidden" name="itemId" value={row.itemId} />
                      <input type="hidden" name="itemType" value="REUSABLE" />
                      <input
                        type="hidden"
                        name="transactionDate"
                        value={defaultDate}
                      />
                      <input
                        type="hidden"
                        name="fromPosition"
                        value="NON_STERILE"
                      />
                      <div className="grid gap-2">
                        <label
                          htmlFor={`process-non-sterile-${row.itemId}`}
                          className="text-sm font-semibold text-slate-700"
                        >
                          Qty proses
                        </label>
                        <input
                          id={`process-non-sterile-${row.itemId}`}
                          type="number"
                          min="1"
                          name="quantity"
                          defaultValue={row.availableNonSterile || ""}
                          disabled={processingPending || row.availableNonSterile === 0}
                          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                        />
                      </div>
                      <input
                        type="hidden"
                        name="notes"
                        value="Proses reusable dari Kotor"
                      />
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="submit"
                          name="intent"
                          value="to-sterilization"
                          disabled={processingPending || row.availableNonSterile === 0}
                          className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Kirim ke Area Pencucian
                        </button>
                        <button
                          type="submit"
                          name="intent"
                          value="mark-damaged-non-sterile"
                          disabled={processingPending || row.availableNonSterile === 0}
                          className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:border-rose-300 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Tandai Rusak
                        </button>
                      </div>
                    </form>

                    <form action={processingAction} className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-800">
                        Dari Area Pencucian
                      </p>
                      <input type="hidden" name="itemId" value={row.itemId} />
                      <input type="hidden" name="itemType" value="REUSABLE" />
                      <input
                        type="hidden"
                        name="transactionDate"
                        value={defaultDate}
                      />
                      <input
                        type="hidden"
                        name="fromPosition"
                        value="STERILIZATION_AREA"
                      />
                      <div className="grid gap-2">
                        <label
                          htmlFor={`process-sterilization-${row.itemId}`}
                          className="text-sm font-semibold text-slate-700"
                        >
                          Qty proses
                        </label>
                        <input
                          id={`process-sterilization-${row.itemId}`}
                          type="number"
                          min="1"
                          name="quantity"
                          defaultValue={row.availableSterilizationArea || ""}
                          disabled={
                            processingPending || row.availableSterilizationArea === 0
                          }
                          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                        />
                      </div>
                      <input
                        type="hidden"
                        name="notes"
                        value="Proses reusable dari Area Pencucian"
                      />
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="submit"
                          name="intent"
                          value="to-ready"
                          disabled={
                            processingPending || row.availableSterilizationArea === 0
                          }
                          className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Tandai Bersih
                        </button>
                        <button
                          type="submit"
                          name="intent"
                          value="mark-damaged-sterilization"
                          disabled={
                            processingPending || row.availableSterilizationArea === 0
                          }
                          className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:border-rose-300 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Tandai Rusak
                        </button>
                      </div>
                    </form>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[1.35rem] border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-600">
                Belum ada reusable di Kotor atau Area Pencucian.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

