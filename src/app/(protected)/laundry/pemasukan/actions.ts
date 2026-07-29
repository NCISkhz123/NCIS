"use server";

import { revalidatePath } from "next/cache";

import { requireLaundryAccess } from "@/lib/auth/guards";
import type {
  ReceiptFormState,
  TransactionImpact,
} from "@/lib/laundry/forms/transactions";
import {
  createSupabaseRpcClient,
  type StockMutationResultData,
} from "@/lib/laundry/services/stock";
import { receiveStock } from "@/lib/laundry/services/receipts";
import { STOCK_POSITION_LABELS } from "@/lib/laundry/constants";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function getStockPositionLabel(position: string | null | undefined) {
  if (!position) {
    return null;
  }

  return STOCK_POSITION_LABELS[position as keyof typeof STOCK_POSITION_LABELS];
}

function buildReceiptImpact(data: StockMutationResultData): TransactionImpact {
  return {
    movementLabel: "Pemasukan tersimpan dan stok Laundry diperbarui.",
    quantity: data.quantity,
    fromLabel: getStockPositionLabel(data.from_position),
    toLabel: getStockPositionLabel(data.to_position),
    resultingBalance: data.resulting_balance,
    resultingBalanceLabel: "Saldo Bersih",
  };
}

export async function saveReceiptAction(
  _previousState: ReceiptFormState,
  formData: FormData
): Promise<ReceiptFormState> {
  await requireLaundryAccess();

  const itemId = String(formData.get("itemId") ?? "");
  const itemType = String(formData.get("itemType") ?? "");
  const transactionDate = String(formData.get("transactionDate") ?? "");
  const quantity = String(formData.get("quantity") ?? "");
  const notes = String(formData.get("notes") ?? "");

  const supabase = await createServerSupabaseClient({
    writeCookies: true,
  });
  const client = createSupabaseRpcClient(supabase);

  const result = await receiveStock(client, {
    itemId,
    itemType,
    transactionDate,
    quantity,
    notes,
  });

  if (!result.success) {
    return {
      error: result.error,
      message: null,
      impact: null,
      values: {
        itemId,
        itemType,
        transactionDate,
        quantity,
        notes,
      },
    };
  }

  revalidatePath("/laundry/pemasukan");
  revalidatePath("/laundry/distribusi");

  return {
    error: null,
    message: "Pemasukan stok berhasil disimpan.",
    impact: buildReceiptImpact(result.data),
  };
}

