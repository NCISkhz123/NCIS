import { format } from "date-fns";
"use client";

import { useActionState, useState } from "react";
import { PackagePlus } from "lucide-react";

import {
  initialReceiptFormState,
  type ReceiptFormState,
} from "@/lib/cssd/forms/transactions";
import { saveReceiptAction } from "@/app/(protected)/cssd/pemasukan/actions";
import { StockSummaryTable } from "@/components/cssd/transactions/stock-summary-table";
import { TransactionFeedback } from "@/components/cssd/transactions/transaction-feedback";
import { TransactionHistoryTable } from "@/components/cssd/transactions/transaction-history-table";
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
} from "@/lib/cssd/services/transaction-read-models";
import type { ItemRow } from "@/lib/cssd/services/master-data";

type ReceiptTransactionViewProps = {
  initialState?: ReceiptFormState;
  items: ItemRow[];
  recentTransactions: TransactionHistoryEntry[];
  stockSummary: StockSummaryEntry[];
  isAdmin?: boolean;
  onDelete?: (id: string, reason: string) => Promise<{ error?: string; success?: boolean }>;
};

export function ReceiptTransactionView({
  initialState = initialReceiptFormState,
  items,
  recentTransactions,
  stockSummary,
  isAdmin,
  onDelete,
}: ReceiptTransactionViewProps) {
  const [formState, formAction, pending] = useActionState(
    saveReceiptAction,
    initialState
  );

  const values = formState.values ?? {};
  const defaultDate = format(new Date(), 'yyyy-MM-dd');
  const activeItemLabel = items.length
    ? `${items[0]?.code} - ${items[0]?.name}`
    : "Belum ada item";

  const [selectedItemType, setSelectedItemType] = useState<string>(values.itemType ?? "");

  return (
    <TransactionPageShell
      eyebrow="CSSD"
      title="Pemasukan"
      description="Catat barang atau item sterilisasi baru yang masuk ke stok CSSD."
      summary={
        <TransactionSummaryStrip
          items={[
            {
              label: "Item aktif",
              value: items.length,
              helper: activeItemLabel,
            },
            {
              label: "Riwayat terbaru",
              value: recentTransactions.length,
              helper: "Pemasukan tercatat di database.",
            },
            {
              label: "Stok saat ini",
              value: stockSummary.length,
              helper: "Acuan stok sebelum barang ditambah.",
              accent: "emphasis",
            },
          ]}
        />
      }
      formTitle="Catat pemasukan"
      formDescription="Pilih item, jenis, tanggal, dan jumlah yang diterima."
      form={
        <form action={formAction} className="grid gap-4">
          <input type="hidden" name="itemType" value={selectedItemType} />
          
          <div className="grid gap-1.5">
            <label
              htmlFor="receipt-item"
              className="text-xs font-semibold uppercase tracking-wider text-slate-700"
            >
              Item CSSD
            </label>
            <SearchableSelect
              id="receipt-item"
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



          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <label
                htmlFor="receipt-date"
                className="text-xs font-semibold uppercase tracking-wider text-slate-700"
              >
                Tanggal Transaksi
              </label>
              <Input
                id="receipt-date"
                type="date"
                name="transactionDate"
                defaultValue={values.transactionDate ?? defaultDate}
                disabled={pending}
              />
            </div>

            <div className="grid gap-1.5">
              <label
                htmlFor="receipt-quantity"
                className="text-xs font-semibold uppercase tracking-wider text-slate-700"
              >
                Jumlah Masuk
              </label>
              <Input
                id="receipt-quantity"
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
            <PackagePlus className="h-4 w-4" />
            <span>{pending ? "Menyimpan..." : "Simpan pemasukan"}</span>
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
