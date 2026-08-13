"use client";
import { format } from "date-fns";

import { useActionState, useState } from "react";
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
import { SearchableSelect } from "@/components/ui/searchable-select";
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
  isAdmin?: boolean;
  onDelete?: (id: string, reason: string) => Promise<{ error?: string; success?: boolean }>;
};

export function DistributionTransactionView({
  initialState = initialDistributionFormState,
  items,
  hospitalUnits,
  recentTransactions,
  isAdmin,
  onDelete,
  stockSummary,
}: DistributionTransactionViewProps) {
  const [formState, formAction, pending] = useActionState(
    saveDistributionAction,
    initialState
  );

  const values = formState.values ?? {};
  const defaultDate = format(new Date(), 'yyyy-MM-dd');
  const activeUnitLabel = hospitalUnits.length
    ? `${hospitalUnits[0]?.name} (${hospitalUnits[0]?.code})`
    : "Belum ada unit";

  const [selectedItemType, setSelectedItemType] = useState<string>(values.itemType ?? "");

  return (
    <TransactionPageShell
      eyebrow="CSSD"
      title="Distribusi"
      description="Kirim barang steril atau consumable ke unit rumah sakit."
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
          <input type="hidden" name="itemType" value={selectedItemType} />
          
          <div className="grid gap-1.5">
            <label
              htmlFor="distribution-item"
              className="text-xs font-semibold uppercase tracking-wider text-slate-700"
            >
              Item CSSD
            </label>
            <SearchableSelect
              id="distribution-item"
              name="itemId"
              defaultValue={values.itemId ?? ""}
              disabled={pending}
              options={items.map((item) => ({
                value: item.id,
                label: item.name,
              }))}
              placeholder="Ketik untuk mencari item..."
              onChange={(val) => {
                const selected = items.find((i) => i.id === val);
                setSelectedItemType(selected?.item_type ?? "");
              }}
            />
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

          <TransactionFeedback
            error={formState.error}
            message={formState.message}
            impact={formState.impact}
          />

          <Button
            type="submit"
            disabled={pending}
            variant="default"
            size="lg"
            className="w-full mt-2"
          >
            <Truck className="h-4 w-4" />
            <span>{pending ? "Menyimpan..." : "Simpan distribusi"}</span>
          </Button>
        </form>
      }
      supportingContent={
        <Card className="h-full flex flex-col min-h-[400px]">
          <CardHeader>
            <CardTitle className="text-base font-bold">Riwayat terbaru</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <TransactionHistoryTable
              caption="Riwayat terbaru"
              rows={recentTransactions}
              isAdmin={isAdmin}
              onDelete={onDelete}
            />
          </CardContent>
        </Card>
      }
    />
  );
}

