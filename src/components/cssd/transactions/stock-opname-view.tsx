"use client";

import { useActionState } from "react";
import { ClipboardCheck, CheckCircle2 } from "lucide-react";

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
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
      <p className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-800">
        {props.error}
      </p>
    );
  }

  if (!props.message) {
    return null;
  }

  return (
    <p className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800">
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
      <div className="grid gap-1.5">
        <label
          htmlFor="opname-date"
          className="text-xs font-semibold uppercase tracking-wider text-slate-800"
        >
          Tanggal Opname
        </label>
        <Input
          id="opname-date"
          type="date"
          name="opnameDate"
          defaultValue={draftValues.opnameDate ?? defaultDate}
          disabled={draftPending}
        />
      </div>

      <FeedbackMessage error={draftState.error} message={draftState.message} />

      <Button
        type="submit"
        disabled={draftPending}
        variant="default"
        size="lg"
        className="w-full mt-2"
      >
        <ClipboardCheck className="h-4 w-4" />
        <span>{draftPending ? "Membuat..." : "Buat sesi"}</span>
      </Button>
    </form>
  ) : (
    <form action={lineAction} className="grid gap-4">
      <input type="hidden" name="sessionId" value={draftSession.id} />

      <div className="grid gap-1.5">
        <label
          htmlFor="opname-item"
          className="text-xs font-semibold uppercase tracking-wider text-slate-800"
        >
          Item Stok
        </label>
        <SearchableSelect
          id="opname-item"
          name="itemId"
          defaultValue={lineValues.itemId ?? ""}
          disabled={linePending}
          options={items.map((item) => ({
            value: item.id,
            label: `${item.name} (${ITEM_TYPE_LABELS[item.item_type]})`,
          }))}
          placeholder="Ketik untuk mencari item..."
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <label
            htmlFor="opname-position"
            className="text-xs font-semibold uppercase tracking-wider text-slate-800"
          >
            Posisi Stok
          </label>
          <Select
            id="opname-position"
            name="stockPosition"
            defaultValue={lineValues.stockPosition ?? "READY"}
            disabled={linePending}
          >
            {REUSABLE_STOCK_POSITIONS.map((position) => (
              <option key={position} value={position}>
                {STOCK_POSITION_LABELS[position]}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid gap-1.5">
          <label
            htmlFor="opname-unit"
            className="text-xs font-semibold uppercase tracking-wider text-slate-800"
          >
            Unit Terkait
          </label>
          <Select
            id="opname-unit"
            name="hospitalUnitId"
            defaultValue={lineValues.hospitalUnitId ?? ""}
            disabled={linePending}
          >
            <option value="">Kosongkan jika tidak di unit</option>
            {hospitalUnits.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name} ({unit.code})
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid gap-1.5">
        <label
          htmlFor="opname-counted-quantity"
          className="text-xs font-semibold uppercase tracking-wider text-slate-800"
        >
          Qty Hitung
        </label>
        <Input
          id="opname-counted-quantity"
          type="number"
          min="0"
          name="countedQuantity"
          placeholder="0"
          defaultValue={lineValues.countedQuantity ?? ""}
          disabled={linePending}
        />
      </div>

      <FeedbackMessage error={lineState.error} message={lineState.message} />

      <Button
        type="submit"
        disabled={linePending}
        variant="default"
        size="lg"
        className="w-full mt-2"
      >
        <span>{linePending ? "Menyimpan..." : "Simpan hasil hitung"}</span>
      </Button>
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
          <Card className="h-full flex flex-col min-h-[400px]">
            <CardHeader>
              <CardTitle className="text-base font-bold">Riwayat sesi</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                caption="Riwayat sesi"
                columns={["Tanggal", "Status", "Baris"]}
                rows={
                  recentSessions.length
                    ? recentSessions.map((session) => [
                        formatDateLabel(session.opnameDate),
                        session.status,
                        session.lineCount,
                      ])
                    : [["-", "Belum ada sesi final", "-"]]
                }
              />
            </CardContent>
          </Card>

          {draftSession ? (
            <Card className="border-sky-300 bg-sky-50/40">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900">
                      Sesi aktif: Tanggal {formatDateLabel(draftSession.opnameDate)} | {draftSession.lineCount} baris
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-600 font-medium">
                      {draftSession.notes ?? "Draft masih bisa dilanjutkan."}
                    </CardDescription>
                  </div>
                  <Badge variant="info" dot>Draft Aktif</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <DataTable
                  caption="Baris tersimpan"
                  columns={[
                    "Item",
                    "Jenis",
                    "Posisi",
                    "Unit",
                    "Qty Hitung",
                    "Qty Sistem",
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
                        ])
                      : [["-", "Belum ada baris", "-", "-", "-", "-"]]
                  }
                />

                <form action={finalizeAction} className="grid gap-3 pt-2">
                  <input type="hidden" name="sessionId" value={draftSession.id} />
                  <FeedbackMessage
                    error={finalizeState.error}
                    message={finalizeState.message}
                  />
                  <Button
                    type="submit"
                    disabled={finalizePending || draftLines.length === 0}
                    variant="default"
                    size="lg"
                    className="w-full"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>
                      {finalizePending ? "Memfinalisasi..." : "Finalisasi hasil"}
                    </span>
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : null}
        </>
      }
    />
  );
}
