import { format } from "date-fns";
"use client";

import { useActionState } from "react";
import { ArrowRight, CheckCircle2, Package } from "lucide-react";

import { processReturnAction } from "../actions";
import { initialReusableProcessingFormState } from "@/lib/cssd/forms/transactions";
import type { ReturnTransactionSessionDetail } from "@/lib/cssd/services/return-processing-read-models";
import { TransactionFeedback } from "@/components/cssd/transactions/transaction-feedback";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ReturnProcessingBoard({ session }: { session: ReturnTransactionSessionDetail }) {
  const [processingState, processingAction, processingPending] = useActionState(
    processReturnAction,
    initialReusableProcessingFormState
  );

  const defaultDate = format(new Date(), 'yyyy-MM-dd');

  return (
    <Card className="border-slate-200 bg-white">
      <CardContent className="pt-6">
        <TransactionFeedback
          error={processingState.error}
          message={processingState.message}
          impact={processingState.impact}
        />

        <div className="mt-4 grid gap-4">
          {session.lines.length ? (
            session.lines.map((row) => (
              <div
                key={row.id}
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
                    <Badge variant="secondary">
                      Dikembalikan: {row.quantity}
                    </Badge>
                    <Badge variant="warning">
                      Kotor: {row.availableNonSterile}
                    </Badge>
                    <Badge variant="info">
                      Sterilisasi: {row.availableSterilizationArea}
                    </Badge>
                    <Badge variant="default" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                      Selesai Steril: {row.processedToReadyQty}
                    </Badge>
                    {(row.damagedNonSterileQty > 0 || row.damagedSterilizationQty > 0) && (
                      <Badge variant="destructive">
                        Total Rusak: {row.damagedNonSterileQty + row.damagedSterilizationQty}
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
                          Kotor
                        </p>
                        <Badge variant="warning">
                          Sisa: {row.availableNonSterile}
                        </Badge>
                      </div>
                      <input type="hidden" name="itemId" value={row.itemId} />
                      <input type="hidden" name="returnLineId" value={row.id} />
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
                        value={`Proses reusable dari Kotor (Ref: ${session.referenceNo || 'Return'})`}
                      />
                      <div className="grid gap-1.5">
                        <label
                          htmlFor={`process-non-sterile-${row.id}`}
                          className="text-xs font-semibold uppercase text-slate-800"
                        >
                          Qty Proses
                        </label>
                        <Input
                          id={`process-non-sterile-${row.id}`}
                          type="number"
                          min="1"
                          max={row.availableNonSterile}
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
                        <span>Kirim ke sterilisasi</span>
                        <ArrowRight className="h-3.5 w-3.5 ml-1" />
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
                          Sisa: {row.availableSterilizationArea}
                        </Badge>
                      </div>
                      <input type="hidden" name="itemId" value={row.itemId} />
                      <input type="hidden" name="returnLineId" value={row.id} />
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
                        value={`Proses reusable dari Area Sterilisasi (Ref: ${session.referenceNo || 'Return'})`}
                      />
                      <div className="grid gap-1.5">
                        <label
                          htmlFor={`process-sterilization-${row.id}`}
                          className="text-xs font-semibold uppercase text-slate-800"
                        >
                          Qty Proses
                        </label>
                        <Input
                          id={`process-sterilization-${row.id}`}
                          type="number"
                          min="1"
                          max={row.availableSterilizationArea}
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
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
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
              Tidak ada item yang ditemukan pada transaksi ini.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
