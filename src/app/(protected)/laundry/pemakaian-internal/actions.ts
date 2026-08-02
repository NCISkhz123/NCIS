"use server";

import { revalidatePath } from "next/cache";

import { requireLaundryAccess } from "@/lib/auth/guards";
import { STOCK_POSITION_LABELS } from "@/lib/laundry/constants";
import type {
  InternalUsageFormState,
  TransactionImpact,
} from "@/lib/laundry/forms/transactions";
import { recordInternalUsage } from "@/lib/laundry/services/internal-usages";
import {
  createSupabaseRpcClient,
  type StockMutationResultData,
} from "@/lib/laundry/services/stock";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function getStockPositionLabel(position: string | null | undefined) {
  if (!position) {
    return null;
  }

  return STOCK_POSITION_LABELS[position as keyof typeof STOCK_POSITION_LABELS];
}

function buildInternalUsageImpact(
  data: StockMutationResultData
): TransactionImpact {
  return {
    movementLabel:
      "Pemakaian internal tersimpan dan stok consumable internal Laundry berkurang.",
    quantity: data.quantity,
    fromLabel: getStockPositionLabel(data.from_position),
    toLabel: getStockPositionLabel(data.to_position),
    resultingBalance: data.resulting_balance,
    resultingBalanceLabel: "Sisa stok Bersih",
  };
}

export async function saveInternalUsageAction(
  _previousState: InternalUsageFormState,
  formData: FormData
): Promise<InternalUsageFormState> {
  await requireLaundryAccess();

  const itemId = String(formData.get("itemId") ?? "");
  const transactionDate = String(formData.get("transactionDate") ?? "");
  const quantity = String(formData.get("quantity") ?? "");
  const notes = String(formData.get("notes") ?? "");

  const supabase = await createServerSupabaseClient({
    writeCookies: true,
  });
  const client = createSupabaseRpcClient(supabase);

  const result = await recordInternalUsage(client, {
    itemId,
    itemType: "CONSUMABLE",
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
        itemType: "CONSUMABLE",
        transactionDate,
        quantity,
        notes,
      },
    };
  }

  revalidatePath("/laundry/pemakaian-internal");
  revalidatePath("/laundry/laporan");

  return {
    error: null,
    message: "Pemakaian internal berhasil disimpan.",
    impact: buildInternalUsageImpact(result.data),
  };
}

