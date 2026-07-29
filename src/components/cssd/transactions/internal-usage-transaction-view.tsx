"use client";

import { useActionState } from "react";
import { Wrench } from "lucide-react";

import {
  initialInternalUsageFormState,
  type InternalUsageFormState,
} from "@/lib/cssd/forms/transactions";
import { saveInternalUsageAction } from "@/app/(protected)/cssd/pemakaian-internal/actions";
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
  const internalItems = items.filter(
    (item) => item.item_type === "CONSUMABLE_INTERNAL"
  );
  const firstInternalItem = internalItems[0]
    ? `${internalItems[0].code} - ${internalItems[0].name}`
    : "Belum ada item internal";

  return (
    <TransactionPageShell
      eyebrow="CSSD"
      title="Pemakaian internal"
      description="Catat konsumabel yang dipakai di CSSD."
      summary={
        <TransactionSummaryStrip
          items={[
            {
              label: "Item internal aktif",
              value: internalItems.length,
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
            <Select
              id="internal-item"
              name="itemId"
              defaultValue={values.itemId ?? ""}
              disabled={pending}
            >
              <option value="">Pilih item</option>
              {internalItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.code} - {item.name}
                </option>
              ))}
            </Select>
          </div>

          <input type="hidden" name="itemType" value="CONSUMABLE_INTERNAL" />

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

          <div className="grid gap-1.5">
            <label
              htmlFor="internal-notes"
              className="text-xs font-semibold uppercase tracking-wider text-slate-700"
            >
              Catatan
            </label>
            <Textarea
              id="internal-notes"
              name="notes"
              rows={3}
              placeholder="Catatan keperluan operasional atau nomor mesin..."
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
            <Wrench className="h-4 w-4" />
            <span>{pending ? "Menyimpan..." : "Simpan Pemakaian Internal"}</span>
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
              <CardTitle className="text-base font-bold">Sisa stok</CardTitle>
            </CardHeader>
            <CardContent>
              <StockSummaryTable caption="Sisa stok" rows={stockSummary} />
            </CardContent>
          </Card>
        </>
      }
    />
  );
}
