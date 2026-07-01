"use client";

import { useActionState } from "react";

import {
  createStockOpnameDraftAction,
  finalizeStockOpnameSessionAction,
  initialStockOpnameDraftFormState,
  initialStockOpnameFinalizeFormState,
  initialStockOpnameLineFormState,
  saveStockOpnameLineAction,
  type StockOpnameDraftFormState,
  type StockOpnameFinalizeFormState,
  type StockOpnameLineFormState,
} from "@/app/(protected)/laundry/stok-opname/actions";
import { DataTable } from "@/components/data/data-table";
import { StockSummaryTable } from "@/components/laundry/transactions/stock-summary-table";
import type { ItemRow, HospitalUnitRow } from "@/lib/laundry/services/master-data";
import type { StockSummaryEntry } from "@/lib/laundry/services/transaction-read-models";
import type {
  StockOpnameLineSummary,
  StockOpnameSessionSummary,
} from "@/lib/laundry/services/stock-opname";
import { ITEM_TYPE_LABELS, REUSABLE_STOCK_POSITIONS, STOCK_POSITION_LABELS } from "@/lib/laundry/constants";

type StockOpnameViewProps = {
  initialDraftState?: StockOpnameDraftFormState;
  initialLineState?: StockOpnameLineFormState;
  initialFinalizeState?: StockOpnameFinalizeFormState;
  items: ItemRow[];
  hospitalUnits: HospitalUnitRow[];
  draftSession: StockOpnameSessionSummary | null;
  draftLines: StockOpnameLineSummary[];
  recentSessions: StockOpnameSessionSummary[];
  stockSummary: StockSummaryEntry[];
};

function FeedbackMessage(props: { error?: string | null; message?: string | null }) {
  if (props.error) {
    return (
      <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {props.error}
      </p>
    );
  }

  if (!props.message) {
    return null;
  }

  return (
    <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
      {props.message}
    </p>
  );
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

export function StockOpnameView({
  initialDraftState = initialStockOpnameDraftFormState,
  initialLineState = initialStockOpnameLineFormState,
  initialFinalizeState = initialStockOpnameFinalizeFormState,
  items,
  hospitalUnits,
  draftSession,
  draftLines,
  recentSessions,
  stockSummary,
}: StockOpnameViewProps) {
  const [draftState, draftAction, draftPending] = useActionState(
    createStockOpnameDraftAction,
    initialDraftState
  );
  const [lineState, lineAction, linePending] = useActionState(
    saveStockOpnameLineAction,
    initialLineState
  );
  const [finalizeState, finalizeAction, finalizePending] = useActionState(
    finalizeStockOpnameSessionAction,
    initialFinalizeState
  );

  const draftValues = draftState.values ?? {};
  const lineValues = lineState.values ?? {};
  const defaultDate = new Date().toISOString().slice(0, 10);

  return (
    <div className="grid gap-6 2xl:grid-cols-[1.08fr_.92fr]">
      <div className="grid gap-6">
        <section className="shell-surface rounded-[1.75rem] p-6">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-slate-500">
            Transaksi Laundry
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
            Kelola Stok Opname Laundry
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            Draft opname dipakai untuk mencatat hitungan fisik tanpa mengubah
            saldo. Perubahan stok baru dilakukan saat finalisasi.
          </p>

          <div className="mt-6">
            <p className="mb-3 text-sm font-semibold text-slate-800">
              Snapshot stok saat ini
            </p>
            <StockSummaryTable caption="Snapshot stok saat ini" rows={stockSummary} />
          </div>
        </section>

        <section className="shell-surface rounded-[1.75rem] p-6">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-slate-500">
            Riwayat Sesi
          </p>
          <h3 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-slate-950">
            Sesi opname terbaru
          </h3>

          <div className="mt-5">
            <DataTable
              caption="Riwayat sesi stok opname"
              columns={["Tanggal", "Status", "Baris", "Catatan"]}
              rows={
                recentSessions.length
                  ? recentSessions.map((session) => [
                      formatDateLabel(session.opnameDate),
                      session.status,
                      session.lineCount,
                      session.notes ?? "-",
                    ])
                  : [["-", "Belum ada sesi final", "-", "-"]]
              }
            />
          </div>
        </section>
      </div>

      <div className="grid gap-6">
        {!draftSession ? (
          <section className="shell-surface rounded-[1.75rem] p-6">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-slate-500">
              Draft Opname
            </p>
            <h3 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-slate-950">
              Buat draft baru
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              MVP hanya mengizinkan satu draft aktif agar tim fokus menyelesaikan
              satu sesi opname lebih dulu.
            </p>

            <form action={draftAction} className="mt-6 grid gap-4">
              <div className="grid gap-2">
                <label
                  htmlFor="opname-date"
                  className="text-sm font-semibold text-slate-700"
                >
                  Tanggal Opname
                </label>
                <input
                  id="opname-date"
                  type="date"
                  name="opnameDate"
                  defaultValue={draftValues.opnameDate ?? defaultDate}
                  disabled={draftPending}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                />
              </div>

              <div className="grid gap-2">
                <label
                  htmlFor="opname-notes"
                  className="text-sm font-semibold text-slate-700"
                >
                  Catatan
                </label>
                <textarea
                  id="opname-notes"
                  name="notes"
                  rows={4}
                  defaultValue={draftValues.notes ?? ""}
                  disabled={draftPending}
                  className="rounded-[1.35rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                />
              </div>

              <FeedbackMessage error={draftState.error} message={draftState.message} />

              <button
                type="submit"
                disabled={draftPending}
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {draftPending ? "Membuat..." : "Buat Draft Opname"}
              </button>
            </form>
          </section>
        ) : (
          <>
            <section className="shell-surface rounded-[1.75rem] p-6">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-slate-500">
                Draft Aktif
              </p>
              <h3 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-slate-950">
                Draft opname aktif
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Tanggal {formatDateLabel(draftSession.opnameDate)} • {draftSession.lineCount} baris
              </p>
              {draftSession.notes ? (
                <p className="mt-2 text-sm leading-6 text-slate-600">{draftSession.notes}</p>
              ) : null}
            </section>

            <section className="shell-surface rounded-[1.75rem] p-6">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-slate-500">
                Baris Opname
              </p>
              <h3 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-slate-950">
                Input hasil hitung
              </h3>

              <form action={lineAction} className="mt-6 grid gap-4">
                <input type="hidden" name="sessionId" value={draftSession.id} />

                <div className="grid gap-2">
                  <label
                    htmlFor="opname-item"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Item Stok
                  </label>
                  <select
                    id="opname-item"
                    name="itemId"
                    defaultValue={lineValues.itemId ?? ""}
                    disabled={linePending}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  >
                    <option value="">Pilih item</option>
                    {items.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.code} - {item.name} ({ITEM_TYPE_LABELS[item.item_type]})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-2 md:grid-cols-2">
                  <div className="grid gap-2">
                    <label
                      htmlFor="opname-position"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Posisi Stok
                    </label>
                    <select
                      id="opname-position"
                      name="stockPosition"
                      defaultValue={lineValues.stockPosition ?? "READY"}
                      disabled={linePending}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                    >
                      {REUSABLE_STOCK_POSITIONS.map((position) => (
                        <option key={position} value={position}>
                          {STOCK_POSITION_LABELS[position]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid gap-2">
                    <label
                      htmlFor="opname-unit"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Unit Terkait
                    </label>
                    <select
                      id="opname-unit"
                      name="hospitalUnitId"
                      defaultValue={lineValues.hospitalUnitId ?? ""}
                      disabled={linePending}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                    >
                      <option value="">Kosongkan jika tidak di unit</option>
                      {hospitalUnits.map((unit) => (
                        <option key={unit.id} value={unit.id}>
                          {unit.name} ({unit.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <label
                    htmlFor="opname-counted-quantity"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Qty Hitung
                  </label>
                  <input
                    id="opname-counted-quantity"
                    type="number"
                    min="0"
                    name="countedQuantity"
                    defaultValue={lineValues.countedQuantity ?? ""}
                    disabled={linePending}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  />
                </div>

                <div className="grid gap-2">
                  <label
                    htmlFor="opname-line-notes"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Catatan
                  </label>
                  <textarea
                    id="opname-line-notes"
                    name="notes"
                    rows={3}
                    defaultValue={lineValues.notes ?? ""}
                    disabled={linePending}
                    className="rounded-[1.35rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  />
                </div>

                <FeedbackMessage error={lineState.error} message={lineState.message} />

                <button
                  type="submit"
                  disabled={linePending}
                  className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {linePending ? "Menyimpan..." : "Simpan Baris Opname"}
                </button>
              </form>
            </section>

            <section className="shell-surface rounded-[1.75rem] p-6">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-slate-500">
                Draft Lines
              </p>
              <h3 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-slate-950">
                Baris opname tersimpan
              </h3>

              <div className="mt-5">
                <DataTable
                  caption="Draft line stok opname"
                  columns={["Item", "Jenis", "Posisi", "Unit", "Qty Hitung", "Qty Sistem", "Catatan"]}
                  rows={
                    draftLines.length
                      ? draftLines.map((line) => [
                          `${line.itemCode} - ${line.itemName}`,
                          ITEM_TYPE_LABELS[line.itemType],
                          line.stockPositionLabel,
                          line.hospitalUnitName ?? "-",
                          line.countedQuantity,
                          line.currentQuantity,
                          line.notes ?? "-",
                        ])
                      : [["-", "Belum ada baris", "-", "-", "-", "-", "-"]]
                  }
                />
              </div>

              <form action={finalizeAction} className="mt-5 grid gap-4">
                <input type="hidden" name="sessionId" value={draftSession.id} />
                <FeedbackMessage
                  error={finalizeState.error}
                  message={finalizeState.message}
                />
                <button
                  type="submit"
                  disabled={finalizePending || draftLines.length === 0}
                  className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {finalizePending ? "Memfinalisasi..." : "Finalisasi Stok Opname"}
                </button>
              </form>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

