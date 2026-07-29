"use client";

import { useActionState } from "react";
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
  const reusableItems = items.filter((item) => item.item_type === "REUSABLE");
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
              htmlFor="return-item"
              className="text-xs font-semibold uppercase tracking-wider text-slate-800"
            >
              Item Reusable
            </label>
            <Select
              id="return-item"
              name="itemId"
              defaultValue={values.itemId ?? ""}
              disabled={returnPending}
            >
              <option value="">Pilih item reusable</option>
              {reusableItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.code} - {item.name}
                </option>
              ))}
            </Select>
          </div>

          <input type="hidden" name="itemType" value="REUSABLE" />

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
              defaultValue={values.sourceUnitId ?? ""}
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

          <div className="grid gap-1.5">
            <label
              htmlFor="return-notes"
              className="text-xs font-semibold uppercase tracking-wider text-slate-800"
            >
              Catatan Pengembalian
            </label>
            <Textarea
              id="return-notes"
              name="notes"
              rows={3}
              placeholder="Catatan kondisi barang atau info penyerahan..."
              defaultValue={values.notes ?? ""}
              disabled={returnPending}
            />
          </div>

          <TransactionFeedback
            error={returnState.error}
            message={returnState.message}
            impact={returnState.impact}
          />

          <Button
            type="submit"
            disabled={returnPending}
            variant="primary"
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
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
                    <Flame className="h-4 w-4 text-amber-600" />
                    Lanjutkan reusable
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-600 font-medium">
                    Pindahkan alat reusable ke tahap sterilisasi atau tandai rusak.
                  </CardDescription>
                </div>
                <Badge variant="warning" dot>
                  {readyToProcessCount} Unit Menunggu
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
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
                                1. Dari Tidak Steril
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
                              variant="amber"
                              size="sm"
                              className="flex-1"
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
                                2. Dari Area Sterilisasi
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
                              variant="success"
                              size="sm"
                              className="flex-1"
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
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold">Riwayat terbaru</CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionHistoryTable
                caption="Riwayat terbaru"
                rows={recentTransactions}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold">Stok reusable saat ini</CardTitle>
            </CardHeader>
            <CardContent>
              <StockSummaryTable caption="Stok reusable saat ini" rows={stockSummary} />
            </CardContent>
          </Card>
        </>
      }
    />
  );
}
