"use client";

import { useActionState, useState } from "react";
import {
  RotateCcw,
  ArrowRight,
  Flame,
  CheckCircle2,
  Package,
} from "lucide-react";

import {
  initialReturnFormState,
  initialReusableProcessingFormState,
  type ReturnFormState,
  type ReusableProcessingFormState,
} from "@/lib/cssd/forms/transactions";
import {
  processReusableAction,
  saveReturnAction,
} from "@/app/(protected)/cssd/pengembalian/actions";
import { StockSummaryTable } from "@/components/cssd/transactions/stock-summary-table";
import { TransactionFeedback } from "@/components/cssd/transactions/transaction-feedback";
import { TransactionHistoryTable } from "@/components/cssd/transactions/transaction-history-table";
import { TransactionPageShell } from "@/components/transactions/transaction-page-shell";
import { TransactionSummaryStrip } from "@/components/transactions/transaction-summary-strip";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Textarea } from "@/components/ui/textarea";
import {
  RETURN_DESTINATION_POSITIONS,
  STOCK_POSITION_LABELS,
} from "@/lib/cssd/constants";
import type {
  ReusableProcessingSummaryEntry,
  StockSummaryEntry,
  TransactionHistoryEntry,
} from "@/lib/cssd/services/transaction-read-models";
import type {
  HospitalUnitRow,
  ItemRow,
} from "@/lib/cssd/services/master-data";

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
  const readyToProcessCount = reusableProcessingSummary.reduce(
    (total, row) => total + row.availableNonSterile + row.availableSterilizationArea,
    0
  );

  return (
    <TransactionPageShell
      eyebrow="CSSD"
      title="Pengembalian reusable"
      description="Catat alat reusable yang kembali dari unit rumah sakit dan proses ke tahap sterilisasi."
      summary={
        <TransactionSummaryStrip
          items={[
            {
              label: "Reusable siap diproses",
              value: readyToProcessCount,
              helper: "Di area tidak steril atau proses sterilisasi.",
              accent: "emphasis",
            },
            {
              label: "Riwayat terbaru",
              value: recentTransactions.length,
              helper: "Pengembalian baru tercatat.",
            },
            {
              label: "Posisi stok reusable",
              value: stockSummary.length,
              helper: "Per posisi unit & area CSSD.",
            },
          ]}
        />
      }
      formTitle="Catat pengembalian"
      formDescription="Pilih item reusable, unit asal, dan posisi tujuan awal."
      form={
        <form action={returnAction} className="grid gap-4">
          <div className="grid gap-1.5">
            <label
              htmlFor="return-source-unit"
              className="text-xs font-semibold uppercase tracking-wider text-slate-800"
            >
              Unit Asal
            </label>
            <Select
              id="return-source-unit"
              name="sourceUnitId"
              value={selectedUnitId}
              onChange={(e) => setSelectedUnitId(e.target.value)}
              disabled={returnPending}
            >
              <option value="">Pilih unit asal</option>
              {hospitalUnits.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name} ({unit.code})
                </option>
              ))}
            </Select>
          </div>

          <div className="grid gap-1.5">
            <label
              htmlFor="return-item"
              className="text-xs font-semibold uppercase tracking-wider text-slate-800"
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <label
                htmlFor="return-date"
                className="text-xs font-semibold uppercase tracking-wider text-slate-800"
              >
                Tanggal Transaksi
              </label>
              <Input
                id="return-date"
                type="date"
                name="transactionDate"
                defaultValue={values.transactionDate ?? defaultDate}
                disabled={returnPending}
              />
            </div>

            <div className="grid gap-1.5">
              <label
                htmlFor="return-quantity"
                className="text-xs font-semibold uppercase tracking-wider text-slate-800"
              >
                Jumlah Kembali
              </label>
              <Input
                id="return-quantity"
                type="number"
                min="1"
                name="quantity"
                placeholder="Jumlah unit"
                defaultValue={values.quantity ?? ""}
                disabled={returnPending}
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <label
              htmlFor="return-destination"
              className="text-xs font-semibold uppercase tracking-wider text-slate-800"
            >
              Tujuan Pengembalian
            </label>
            <Select
              id="return-destination"
              name="destinationPosition"
              defaultValue={
                values.destinationPosition ?? RETURN_DESTINATION_POSITIONS[0]
              }
              disabled={returnPending}
            >
              {RETURN_DESTINATION_POSITIONS.map((position) => (
                <option key={position} value={position}>
                  {STOCK_POSITION_LABELS[position]}
                </option>
              ))}
            </Select>
          </div>

          <TransactionFeedback
            error={returnState.error}
            message={returnState.message}
            impact={returnState.impact}
          />

          <Button
            type="submit"
            disabled={returnPending}
            variant="default"
            size="lg"
            className="w-full mt-2"
          >
            <RotateCcw className="h-4 w-4" />
            <span>{returnPending ? "Menyimpan..." : "Simpan pengembalian"}</span>
          </Button>
        </form>
      }
      supportingContent={
        <>
          {/* Reusable Processing Board */}
          <Card className="border-slate-200 bg-white">
            <CardContent className="pt-6">
              <TransactionFeedback
                error={processingState.error}
                message={processingState.message}
                impact={processingState.impact}
              />

              <div className="mt-4 grid gap-4">
                {reusableProcessingSummary.length ? (
                  reusableProcessingSummary.map((row) => (
                    <div
                      key={row.itemId}
                      className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 shadow-2xs"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-sky-600" />
                          <p className="text-sm font-bold text-slate-900">
                            {row.itemCode} - {row.itemName}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge variant="warning">
                            Tidak Steril: {row.availableNonSterile}
                          </Badge>
                          <Badge variant="info">
                            Sterilisasi: {row.availableSterilizationArea}
                          </Badge>
                          {row.availableDamaged > 0 && (
                            <Badge variant="destructive">
                              Rusak: {row.availableDamaged}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        {/* Process from NON_STERILE */}
                        <form
                          action={processingAction}
                          className="flex flex-col justify-between rounded-xl border border-amber-300 bg-amber-50/80 p-4"
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-bold uppercase tracking-wider text-amber-950">
                                Tidak Steril
                              </p>
                              <Badge variant="warning">
                                Stok: {row.availableNonSterile}
                              </Badge>
                            </div>
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
                            <input
                              type="hidden"
                              name="notes"
                              value="Proses reusable dari Tidak Steril"
                            />
                            <div className="grid gap-1.5">
                              <label
                                htmlFor={`process-non-sterile-${row.itemId}`}
                                className="text-xs font-semibold uppercase text-slate-800"
                              >
                                Qty Proses
                              </label>
                              <Input
                                id={`process-non-sterile-${row.itemId}`}
                                type="number"
                                min="1"
                                name="quantity"
                                defaultValue={row.availableNonSterile || ""}
                                disabled={
                                  processingPending || row.availableNonSterile === 0
                                }
                              />
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2 pt-2">
                            <Button
                              type="submit"
                              name="intent"
                              value="to-sterilization"
                              disabled={
                                processingPending || row.availableNonSterile === 0
                              }
                              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                            >
                              <span>Kirim ke area sterilisasi</span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              type="submit"
                              name="intent"
                              value="mark-damaged-non-sterile"
                              disabled={
                                processingPending || row.availableNonSterile === 0
                              }
                              variant="destructive"
                              size="sm"
                            >
                              <span>Tandai rusak</span>
                            </Button>
                          </div>
                        </form>

                        {/* Process from STERILIZATION_AREA */}
                        <form
                          action={processingAction}
                          className="flex flex-col justify-between rounded-xl border border-sky-300 bg-sky-50/80 p-4"
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-bold uppercase tracking-wider text-sky-950">
                                Area Sterilisasi
                              </p>
                              <Badge variant="info">
                                Stok: {row.availableSterilizationArea}
                              </Badge>
                            </div>
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
                            <input
                              type="hidden"
                              name="notes"
                              value="Proses reusable dari Area Sterilisasi"
                            />
                            <div className="grid gap-1.5">
                              <label
                                htmlFor={`process-sterilization-${row.itemId}`}
                                className="text-xs font-semibold uppercase text-slate-800"
                              >
                                Qty Proses
                              </label>
                              <Input
                                id={`process-sterilization-${row.itemId}`}
                                type="number"
                                min="1"
                                name="quantity"
                                defaultValue={row.availableSterilizationArea || ""}
                                disabled={
                                  processingPending ||
                                  row.availableSterilizationArea === 0
                                }
                              />
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2 pt-2">
                            <Button
                              type="submit"
                              name="intent"
                              value="to-ready"
                              disabled={
                                processingPending ||
                                row.availableSterilizationArea === 0
                              }
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Tandai steril</span>
                            </Button>
                            <Button
                              type="submit"
                              name="intent"
                              value="mark-damaged-sterilization"
                              disabled={
                                processingPending ||
                                row.availableSterilizationArea === 0
                              }
                              variant="destructive"
                              size="sm"
                            >
                              <span>Tandai rusak</span>
                            </Button>
                          </div>
                        </form>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-xs font-semibold text-slate-700">
                    Tidak ada reusable yang berada di area Tidak Steril atau Area Sterilisasi saat ini.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions & Stock Summary */}
          <Card className="h-full flex flex-col min-h-[400px]">
            <CardHeader>
              <CardTitle className="text-base font-bold">Riwayat terbaru</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <TransactionHistoryTable
                caption="Riwayat terbaru"
                rows={recentTransactions}
              />
            </CardContent>
          </Card>
        </>
      }
    />
  );
}
