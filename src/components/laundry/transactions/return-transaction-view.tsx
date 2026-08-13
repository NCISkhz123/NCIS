"use client";
import { format } from "date-fns";

import { useActionState, useState } from "react";
import {
  RotateCcw,
} from "lucide-react";

import {
  initialReturnFormState,
  type ReturnFormState,
} from "@/lib/laundry/forms/transactions";
import {
  saveReturnAction,
} from "@/app/(protected)/laundry/pengembalian/actions";
import { StockSummaryTable } from "@/components/laundry/transactions/stock-summary-table";
import { TransactionFeedback } from "@/components/laundry/transactions/transaction-feedback";
import { TransactionHistoryTable } from "@/components/laundry/transactions/transaction-history-table";
import { TransactionPageShell } from "@/components/transactions/transaction-page-shell";
import { TransactionSummaryStrip } from "@/components/transactions/transaction-summary-strip";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import type {
  StockSummaryEntry,
  TransactionHistoryEntry,
} from "@/lib/laundry/services/transaction-read-models";
import type {
  HospitalUnitRow,
  ItemRow,
} from "@/lib/laundry/services/master-data";

type ReturnTransactionViewProps = {
  initialState?: ReturnFormState;
  items: ItemRow[];
  hospitalUnits: HospitalUnitRow[];
  recentTransactions: TransactionHistoryEntry[];
  stockSummary: StockSummaryEntry[];
  isAdmin?: boolean;
  onDelete?: (id: string, reason: string) => Promise<{ error?: string; success?: boolean }>;
};

export function ReturnTransactionView({
  initialState = initialReturnFormState,
  items,
  hospitalUnits,
  recentTransactions,
  isAdmin,
  onDelete,
  stockSummary,
}: ReturnTransactionViewProps) {
  const [returnState, returnAction, returnPending] = useActionState(
    saveReturnAction,
    initialState
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

  const defaultDate = format(new Date(), 'yyyy-MM-dd');


  return (
    <TransactionPageShell
      eyebrow="Laundry"
      title="Pengembalian reusable"
      description="Catat alat reusable yang kembali dari unit rumah sakit dan proses ke tahap pencucian."
      summary={
        <TransactionSummaryStrip
          items={[

            {
              label: "Riwayat terbaru",
              value: recentTransactions.length,
              helper: "Pengembalian baru tercatat.",
            },
            {
              label: "Posisi stok reusable",
              value: stockSummary.length,
              helper: "Per posisi unit & area Laundry.",
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

          <input type="hidden" name="destinationPosition" value="NON_STERILE" />

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


          {/* Recent Transactions & Stock Summary */}
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
        </>
      }
    />
  );
}

