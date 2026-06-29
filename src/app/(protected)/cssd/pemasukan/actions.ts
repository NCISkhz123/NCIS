"use server";

import { revalidatePath } from "next/cache";

import { requireCssdAccess } from "@/lib/auth/guards";
import {
  createSupabaseRpcClient,
  type StockMutationResultData,
} from "@/lib/cssd/services/stock";
import { receiveStock } from "@/lib/cssd/services/receipts";
import { STOCK_POSITION_LABELS } from "@/lib/cssd/constants";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type ReceiptImpact = {
  movementLabel: string;
  quantity: number;
  fromLabel?: string | null;
  toLabel?: string | null;
  resultingBalance: number;
  resultingBalanceLabel: string;
};

export type ReceiptFormState = {
  error: string | null;
  message: string | null;
  impact: ReceiptImpact | null;
  values?: {
    itemId?: string;
    itemType?: string;
    transactionDate?: string;
    quantity?: string;
    notes?: string;
  };
};

export const initialReceiptFormState: ReceiptFormState = {
  error: null,
  message: null,
  impact: null,
};

function getStockPositionLabel(position: string | null | undefined) {
  if (!position) {
    return null;
  }

  return STOCK_POSITION_LABELS[position as keyof typeof STOCK_POSITION_LABELS];
}

function buildReceiptImpact(data: StockMutationResultData): ReceiptImpact {
  return {
    movementLabel: "Pemasukan tersimpan dan stok CSSD diperbarui.",
    quantity: data.quantity,
    fromLabel: getStockPositionLabel(data.from_position),
    toLabel: getStockPositionLabel(data.to_position),
    resultingBalance: data.resulting_balance,
    resultingBalanceLabel: "Saldo Siap Pakai",
  };
}

export async function saveReceiptAction(
  _previousState: ReceiptFormState,
  formData: FormData
): Promise<ReceiptFormState> {
  await requireCssdAccess();

  const itemId = String(formData.get("itemId") ?? "");
  const itemType = String(formData.get("itemType") ?? "");
  const transactionDate = String(formData.get("transactionDate") ?? "");
  const quantity = String(formData.get("quantity") ?? "");
  const notes = String(formData.get("notes") ?? "");

  const supabase = await createServerSupabaseClient();
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

  revalidatePath("/cssd/pemasukan");
  revalidatePath("/cssd/distribusi");

  return {
    error: null,
    message: "Pemasukan stok berhasil disimpan.",
    impact: buildReceiptImpact(result.data),
  };
}
