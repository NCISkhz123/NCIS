"use client";

import { useActionState } from "react";
import { Truck } from "lucide-react";

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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { HospitalUnitRow, ItemRow } from "@/lib/cssd/services/master-data";
import type {
  StockSummaryEntry,
  TransactionHistoryEntry,
} from "@/lib/cssd/services/transaction-read-models";

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
  const activeUnitLabel = hospitalUnits.length
    ? `${hospitalUnits[0]?.name} (${hospitalUnits[0]?.code})`
    : "Belum ada unit";

  return (
    <TransactionPageShell
      eyebrow="CSSD"
      title="Distribusi"
      description="Kirim barang steril atau konsumabel ke unit rumah sakit."
      summary={
        <TransactionSummaryStrip
          items={[
            {
              label: "Unit tujuan aktif",
              value: hospitalUnits.length,
              helper: activeUnitLabel,
            },
            {
              label: "Riwayat terbaru",
              value: recentTransactions.length,
              helper: "Distribusi tercatat di database.",
            },
            {
              label: "Stok siap kirim",
              value: stockSummary.length,
              helper: "Stok posisi steril di area CSSD.",
              accent: "emphasis",
            },
          ]}
        />
      }
      formTitle="Catat distribusi"
      formDescription="Pilih item, unit tujuan, tanggal, dan jumlah pengiriman."
      form={
        <form action={formAction} className="grid gap-4">
          <div className="grid gap-1.5">
            <label
              htmlFor="distribution-item"
              className="text-xs font-semibold uppercase tracking-wider text-slate-700"
            >
              Item CSSD
            </label>
            <Select
              id="distribution-item"
              name="itemId"
              defaultValue={values.itemId ?? ""}
              disabled={pending}
            >
              <option value="">Pilih item</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.code} - {item.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid gap-1.5">
            <label
              htmlFor="distribution-target-unit"
              className="text-xs font-semibold uppercase tracking-wider text-slate-700"
            >
              Unit Tujuan
            </label>
            <Select
              id="distribution-target-unit"
              name="targetUnitId"
              defaultValue={values.targetUnitId ?? ""}
              disabled={pending}
            >
              <option value="">Pilih unit tujuan</option>
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
                htmlFor="distribution-date"
                className="text-xs font-semibold uppercase tracking-wider text-slate-700"
              >
                Tanggal Transaksi
              </label>
              <Input
                id="distribution-date"
                type="date"
                name="transactionDate"
                defaultValue={values.transactionDate ?? defaultDate}
                disabled={pending}
              />
            </div>

            <div className="grid gap-1.5">
              <label
                htmlFor="distribution-quantity"
                className="text-xs font-semibold uppercase tracking-wider text-slate-700"
              >
                Jumlah Distribusi
              </label>
              <Input
                id="distribution-quantity"
                type="number"
                min="1"
                name="quantity"
                placeholder="Jumlah unit"
                defaultValue={values.quantity ?? ""}
                disabled={pending}
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <label
              htmlFor="distribution-notes"
              className="text-xs font-semibold uppercase tracking-wider text-slate-700"
            >
              Catatan
            </label>
            <Textarea
              id="distribution-notes"
              name="notes"
              rows={3}
              placeholder="Catatan pengiriman atau penanggung jawab unit..."
              defaultValue={values.notes ?? ""}
              disabled={pending}
            />
          </div>

          <TransactionFeedback
            error={formState.error}
            message={formState.message}
            impact={formState.impact}
          />

          <Button
            type="submit"
            disabled={pending}
            variant="primary"
            size="lg"
            className="w-full mt-2"
          >
            <Truck className="h-4 w-4" />
            <span>{pending ? "Menyimpan..." : "Simpan distribusi"}</span>
          </Button>
        </form>
      }
      supportingContent={
        <>
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
              <CardTitle className="text-base font-bold">Stok siap kirim</CardTitle>
            </CardHeader>
            <CardContent>
              <StockSummaryTable caption="Stok siap kirim" rows={stockSummary} />
            </CardContent>
          </Card>
        </>
      }
    />
  );
}
