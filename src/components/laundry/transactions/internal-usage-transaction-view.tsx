"use client";

import { useActionState } from "react";
import { Wrench } from "lucide-react";

import {
  initialInternalUsageFormState,
  type InternalUsageFormState,
} from "@/lib/laundry/forms/transactions";
import { saveInternalUsageAction } from "@/app/(protected)/laundry/pemakaian-internal/actions";
import { StockSummaryTable } from "@/components/laundry/transactions/stock-summary-table";
import { TransactionFeedback } from "@/components/laundry/transactions/transaction-feedback";
import { TransactionHistoryTable } from "@/components/laundry/transactions/transaction-history-table";
import { TransactionPageShell } from "@/components/transactions/transaction-page-shell";
import { TransactionSummaryStrip } from "@/components/transactions/transaction-summary-strip";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Textarea } from "@/components/ui/textarea";
import type {
  StockSummaryEntry,
  TransactionHistoryEntry,
} from "@/lib/laundry/services/transaction-read-models";
import type { ItemRow } from "@/lib/laundry/services/master-data";

type InternalUsageTransactionViewProps = {
  initialState?: InternalUsageFormState;
  items: ItemRow[];
  recentTransactions: TransactionHistoryEntry[];
  stockSummary: StockSummaryEntry[];
};

export function InternalUsageTransactionView({
  initialState = initialInternalUsageFormState,
  items,
  recentTransactions,
  stockSummary,
}: InternalUsageTransactionViewProps) {
  const [formState, formAction, pending] = useActionState(
    saveInternalUsageAction,
    initialState
  );

  const values = formState.values ?? {};
  const defaultDate = new Date().toISOString().slice(0, 10);
  const consumableItems = items.filter(
    (item) => item.item_type === "CONSUMABLE"
  );
  const firstInternalItem = consumableItems[0]
    ? `${consumableItems[0].code} - ${consumableItems[0].name}`
    : "Belum ada item internal";

  return (
    <TransactionPageShell
      eyebrow="Laundry"
      title="Pemakaian internal"
      description="Catat consumable yang dipakai di Laundry."
      summary={
        <TransactionSummaryStrip
          items={[
            {
              label: "Item internal aktif",
              value: consumableItems.length,
              helper: firstInternalItem,
            },
            {
              label: "Riwayat terbaru",
              value: recentTransactions.length,
              helper: "Pemakaian internal yang sudah tercatat.",
            },
            {
              label: "Sisa stok",
              value: stockSummary.length,
              helper: "Cek stok sebelum dipakai.",
              accent: "emphasis",
            },
          ]}
        />
      }
      formTitle="Catat pemakaian"
      formDescription="Pilih item, isi tanggal, jumlah pakai, lalu simpan."
      form={
        <form action={formAction} className="grid gap-4">
          <div className="grid gap-1.5">
            <label
              htmlFor="internal-item"
              className="text-xs font-semibold uppercase tracking-wider text-slate-700"
            >
              Item Konsumabel Internal
            </label>
            <SearchableSelect
              id="internal-item"
              name="itemId"
              defaultValue={values.itemId ?? ""}
              disabled={pending}
              options={consumableItems.map((item) => ({
                value: item.id,
                label: item.name,
              }))}
              placeholder="Ketik untuk mencari item..."
            />
          </div>

          <input type="hidden" name="itemType" value="CONSUMABLE" />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <label
                htmlFor="internal-date"
                className="text-xs font-semibold uppercase tracking-wider text-slate-700"
              >
                Tanggal Transaksi
              </label>
              <Input
                id="internal-date"
                type="date"
                name="transactionDate"
                defaultValue={values.transactionDate ?? defaultDate}
                disabled={pending}
              />
            </div>

            <div className="grid gap-1.5">
              <label
                htmlFor="internal-quantity"
                className="text-xs font-semibold uppercase tracking-wider text-slate-700"
              >
                Jumlah Pakai
              </label>
              <Input
                id="internal-quantity"
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
            <Wrench className="h-4 w-4" />
            <span>{pending ? "Menyimpan..." : "Simpan Pemakaian Internal"}</span>
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
            />
          </CardContent>
        </Card>
      }
    />
  );
}
