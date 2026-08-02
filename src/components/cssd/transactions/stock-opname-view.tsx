"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
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
  submitStockOpnameDraftAction,
  rejectStockOpnamePendingAction,
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
  isChecker?: boolean;
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
  isChecker = false,
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
  const [submitState, submitAction, submitPending] = useActionState(
    submitStockOpnameDraftAction,
    initialFinalizeState
  );
  const [rejectState, rejectAction, rejectPending] = useActionState(
    rejectStockOpnamePendingAction,
    initialFinalizeState
  );

  const draftValues = draftState.values ?? {};
  const lineValues = lineState.values ?? {};
  const defaultDate = new Date().toISOString().slice(0, 10);

  const hasUnitScope = Boolean(draftSession?.hospitalUnitId);
  const defaultPosition = lineValues.stockPosition ?? (hasUnitScope ? "IN_UNIT" : "READY");
  const [selectedPosition, setSelectedPosition] = useState<string>();
  const currentPosition = selectedPosition ?? defaultPosition;

  const scopeLabel =
    draftSession?.scopeType === "INTERNAL"
      ? "Depo Utama CSSD"
      : draftSession?.scopeType === "UNIT" && draftSession.hospitalUnitName
        ? `Unit ${draftSession.hospitalUnitName}`
        : "Seluruh Unit (Global)";

  const summaryItems = draftSession
    ? [
        {
          label: "Sesi aktif",
          value: formatDateLabel(draftSession.opnameDate),
          helper: `Cakupan: ${scopeLabel}`,
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

      <div className="grid gap-1.5">
        <label
          htmlFor="opname-unit-scope"
          className="text-xs font-semibold uppercase tracking-wider text-slate-800"
        >
          Cakupan Unit
        </label>
        <Select
          id="opname-unit-scope"
          name="hospitalUnitId"
          defaultValue={draftValues.hospitalUnitId ?? ""}
          disabled={draftPending}
        >
          <option value="">Seluruh Unit (Global)</option>
          <option value="INTERNAL">Depo Utama CSSD</option>
          {hospitalUnits.map((unit) => (
            <option key={unit.id} value={unit.id}>
              {unit.name} ({unit.code})
            </option>
          ))}
        </Select>
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
  ) : draftSession.status === "DRAFT" ? (
    <form action={lineAction} className="grid gap-4">
      <input type="hidden" name="sessionId" value={draftSession.id} />
      {hasUnitScope ? (
        <input
          type="hidden"
          name="hospitalUnitId"
          value={draftSession.hospitalUnitId!}
        />
      ) : null}

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
            value={currentPosition}
            onChange={(e) => setSelectedPosition(e.target.value)}
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
            name={hasUnitScope ? undefined : "hospitalUnitId"}
            defaultValue={
              hasUnitScope
                ? draftSession.hospitalUnitId!
                : (lineValues.hospitalUnitId ?? "")
            }
            disabled={linePending || hasUnitScope || currentPosition !== "IN_UNIT"}
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
  ) : (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
      <h3 className="font-bold text-amber-900 mb-2">Menunggu Persetujuan</h3>
      <p className="text-sm text-amber-800">
        Sesi ini sedang dalam tahap review dan tidak dapat diubah. 
        Menunggu keputusan Supervisor.
      </p>
    </div>
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
                  columns={["Tanggal", "Status", "Baris", "Aksi"]}
                  rows={
                    recentSessions.length
                      ? recentSessions.map((session) => [
                          formatDateLabel(session.opnameDate),
                          session.status,
                          session.lineCount,
                          <Link key={session.id} href={`/cssd/stok-opname/${session.id}`} className="text-xs font-semibold text-blue-600 hover:underline">
                            Detail
                          </Link>
                        ])
                      : [["-", "Belum ada sesi final", "-", "-"]]
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
                      Cakupan: {scopeLabel}
                      {draftSession.notes ? ` • ${draftSession.notes}` : ""}
                    </CardDescription>
                  </div>
                  <Badge variant={draftSession.status === "PENDING_APPROVAL" ? "warning" : "info"} dot>
                    {draftSession.status === "PENDING_APPROVAL" ? "Menunggu Review" : "Draft Aktif"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-slate-500 mb-2">
                  * Untuk mengubah hasil hitung, input kembali item dan posisi yang sama dengan jumlah yang baru.
                </p>
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

                {draftSession.status === "DRAFT" ? (
                  <form action={submitAction} className="grid gap-3 pt-2">
                    <input type="hidden" name="sessionId" value={draftSession.id} />
                    <FeedbackMessage
                      error={submitState.error}
                      message={submitState.message}
                    />
                    <Button
                      type="submit"
                      disabled={submitPending || draftLines.length === 0}
                      variant="default"
                      size="lg"
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <ClipboardCheck className="h-4 w-4" />
                      <span>
                        {submitPending ? "Mengajukan..." : "Ajukan Review"}
                      </span>
                    </Button>
                  </form>
                ) : draftSession.status === "PENDING_APPROVAL" ? (
                  <div className="grid gap-3 pt-2">
                    {isChecker ? (
                      <div className="grid gap-3">
                        <form action={finalizeAction} className="grid gap-3">
                          <input type="hidden" name="sessionId" value={draftSession.id} />
                          <FeedbackMessage
                            error={finalizeState.error}
                            message={finalizeState.message}
                          />
                          <Button
                            type="submit"
                            disabled={finalizePending}
                            variant="default"
                            size="lg"
                            className="w-full bg-emerald-600 hover:bg-emerald-700"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            <span>
                              {finalizePending ? "Memfinalisasi..." : "Setujui & Finalisasi"}
                            </span>
                          </Button>
                        </form>
                        <form action={rejectAction} className="grid gap-3">
                          <input type="hidden" name="sessionId" value={draftSession.id} />
                          <FeedbackMessage
                            error={rejectState.error}
                            message={rejectState.message}
                          />
                          <Button
                            type="submit"
                            disabled={rejectPending}
                            variant="outline"
                            size="lg"
                            className="w-full border-rose-200 text-rose-700 hover:bg-rose-50"
                          >
                            <span>
                              {rejectPending ? "Membatalkan..." : "Tolak / Kembalikan ke Draft"}
                            </span>
                          </Button>
                        </form>
                      </div>
                    ) : (
                      <p className="text-center text-sm font-medium text-slate-500 py-3">
                        Hanya Supervisor yang dapat menyetujui sesi ini.
                      </p>
                    )}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ) : null}
        </>
      }
    />
  );
}
