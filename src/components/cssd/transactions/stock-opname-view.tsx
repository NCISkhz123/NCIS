"use client";

import { useActionState } from "react";

import {
  initialStockOpnameDraftFormState,
  initialStockOpnameFinalizeFormState,
  initialStockOpnameLineFormState,
  type StockOpnameDraftFormState,
  type StockOpnameFinalizeFormState,
  type StockOpnameLineFormState,
} from "@/lib/cssd/forms/transactions";
import {
  createStockOpnameDraftAction,
  finalizeStockOpnameSessionAction,
  saveStockOpnameLineAction,
} from "@/app/(protected)/cssd/stok-opname/actions";
import { DataTable } from "@/components/data/data-table";
import { StockSummaryTable } from "@/components/cssd/transactions/stock-summary-table";
import { TransactionPageShell } from "@/components/transactions/transaction-page-shell";
import { TransactionSummaryStrip } from "@/components/transactions/transaction-summary-strip";
import type { HospitalUnitRow, ItemRow } from "@/lib/cssd/services/master-data";
import type { StockSummaryEntry } from "@/lib/cssd/services/transaction-read-models";
import type {
  StockOpnameLineSummary,
  StockOpnameSessionSummary,
} from "@/lib/cssd/services/stock-opname";
import {
  ITEM_TYPE_LABELS,
  REUSABLE_STOCK_POSITIONS,
  STOCK_POSITION_LABELS,
} from "@/lib/cssd/constants";

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

function FeedbackMessage(props: {
  error?: string | null;
  message?: string | null;
}) {
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

  const summaryItems = draftSession
    ? [
        {
          label: "Sesi aktif",
          value: formatDateLabel(draftSession.opnameDate),
          helper: draftSession.notes ?? "Draft masih bisa dilanjutkan.",
        },
        {
          label: "Baris tersimpan",
          value: draftLines.length,
          helper: `${draftSession.lineCount} baris tercatat di sesi ini.`,
        },
        {
          label: "Posisi stok",
          value: stockSummary.length,
          helper: "Cek stok sistem saat membandingkan hasil hitung.",
          accent: "emphasis" as const,
        },
      ]
    : [
        {
          label: "Belum ada sesi aktif",
          value: "Mulai sesi baru",
          helper: "Buat satu sesi saat hitung fisik dimulai.",
        },
        {
          label: "Posisi stok",
          value: stockSummary.length,
          helper: "Dipakai sebagai acuan sebelum input hasil hitung.",
        },
        {
          label: "Riwayat sesi",
          value: recentSessions.length,
          helper: "Sesi yang sudah selesai bisa dicek kembali.",
          accent: "emphasis" as const,
        },
      ];

  const formContent = !draftSession ? (
    <form action={draftAction} className="grid gap-4">
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
        {draftPending ? "Membuat..." : "Buat sesi"}
      </button>
    </form>
  ) : (
    <form action={lineAction} className="grid gap-4">
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
        {linePending ? "Menyimpan..." : "Simpan hasil hitung"}
      </button>
    </form>
  );

  return (
    <TransactionPageShell
      eyebrow="CSSD"
      title="Stok opname"
      description="Cocokkan stok sistem dengan hitungan fisik."
      summary={<TransactionSummaryStrip items={summaryItems} />}
      formTitle={draftSession ? "Input hasil hitung" : "Mulai sesi"}
      formDescription={
        draftSession
          ? "Pilih item, posisi stok, lalu simpan hasil hitung fisik."
          : "Tentukan tanggal opname lalu buat sesi baru."
      }
      form={formContent}
      supportingContent={
        <>
          <section className="shell-surface rounded-[1.75rem] p-6 md:p-7">
            <p className="text-sm font-semibold text-slate-900">Posisi stok</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Gunakan stok sistem sebagai pembanding saat hitung fisik.
            </p>
            <div className="mt-5">
              <StockSummaryTable caption="Posisi stok" rows={stockSummary} />
            </div>
          </section>

          <section className="shell-surface rounded-[1.75rem] p-6">
            <p className="text-sm font-semibold text-slate-900">Riwayat sesi</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Lihat sesi opname yang sudah selesai.
            </p>
            <div className="mt-5">
              <DataTable
                caption="Riwayat sesi"
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

          {draftSession ? (
            <>
              <section className="shell-surface rounded-[1.75rem] p-6">
                <p className="text-sm font-semibold text-slate-900">Sesi aktif</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Tanggal {formatDateLabel(draftSession.opnameDate)} |{" "}
                  {draftSession.lineCount} baris
                </p>
                {draftSession.notes ? (
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {draftSession.notes}
                  </p>
                ) : null}
              </section>

              <section className="shell-surface rounded-[1.75rem] p-6">
                <p className="text-sm font-semibold text-slate-900">
                  Hasil hitung
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Periksa hasil hitung sebelum finalisasi.
                </p>

                <div className="mt-5">
                  <DataTable
                    caption="Baris tersimpan"
                    columns={[
                      "Item",
                      "Jenis",
                      "Posisi",
                      "Unit",
                      "Qty Hitung",
                      "Qty Sistem",
                      "Catatan",
                    ]}
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
                    {finalizePending ? "Memfinalisasi..." : "Finalisasi hasil"}
                  </button>
                </form>
              </section>
            </>
          ) : null}
        </>
      }
    />
  );
}
