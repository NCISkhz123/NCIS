"use client";

import { useActionState } from "react";
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
import { Select } from "@/components/ui/select";
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
};

export function ReceiptTransactionView({
  initialState = initialReceiptFormState,
  items,
  recentTransactions,
  stockSummary,
}: ReceiptTransactionViewProps) {
  const [formState, formAction, pending] = useActionState(
    saveReceiptAction,
    initialState
  );

  const values = formState.values ?? {};
  const defaultDate = new Date().toISOString().slice(0, 10);
  const activeItemLabel = items.length
    ? `${items[0]?.code} - ${items[0]?.name}`
    : "Belum ada item";

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
          <div className="grid gap-1.5">
            <label
              htmlFor="receipt-item"
              className="text-xs font-semibold uppercase tracking-wider text-slate-700"
            >
              Item CSSD
            </label>
            <Select
              id="receipt-item"
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
              htmlFor="receipt-item-type"
              className="text-xs font-semibold uppercase tracking-wider text-slate-700"
            >
              Jenis Item
            </label>
            <Select
              id="receipt-item-type"
              name="itemType"
              defaultValue={values.itemType ?? "REUSABLE"}
              disabled={pending}
            >
              <option value="REUSABLE">Reusable</option>
              <option value="CONSUMABLE_DISTRIBUTION">
                Konsumabel Distribusi
              </option>
              <option value="CONSUMABLE_INTERNAL">Konsumabel Internal</option>
            </Select>
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

          <div className="grid gap-1.5">
            <label
              htmlFor="receipt-notes"
              className="text-xs font-semibold uppercase tracking-wider text-slate-700"
            >
              Catatan
            </label>
            <Textarea
              id="receipt-notes"
              name="notes"
              rows={3}
              placeholder="Nomor batch, supplier, atau catatan penerimaan..."
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
            <PackagePlus className="h-4 w-4" />
            <span>{pending ? "Menyimpan..." : "Simpan pemasukan"}</span>
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
              <CardTitle className="text-base font-bold">Stok saat ini</CardTitle>
            </CardHeader>
            <CardContent>
              <StockSummaryTable caption="Stok saat ini" rows={stockSummary} />
            </CardContent>
          </Card>
        </>
      }
    />
  );
}
