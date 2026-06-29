"use server";

import { revalidatePath } from "next/cache";

import { requireCssdAccess } from "@/lib/auth/guards";
import { STOCK_POSITION_LABELS } from "@/lib/cssd/constants";
import { recordInternalUsage } from "@/lib/cssd/services/internal-usages";
import {
  createSupabaseRpcClient,
  type StockMutationResultData,
} from "@/lib/cssd/services/stock";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type InternalUsageImpact = {
  movementLabel: string;
  quantity: number;
  fromLabel?: string | null;
  toLabel?: string | null;
  resultingBalance: number;
  resultingBalanceLabel: string;
};

export type InternalUsageFormState = {
  error: string | null;
  message: string | null;
  impact: InternalUsageImpact | null;
  values?: {
    itemId?: string;
    itemType?: string;
    transactionDate?: string;
    quantity?: string;
    notes?: string;
  };
};

export const initialInternalUsageFormState: InternalUsageFormState = {
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

function buildInternalUsageImpact(
  data: StockMutationResultData
): InternalUsageImpact {
  return {
    movementLabel:
      "Pemakaian internal tersimpan dan stok konsumabel internal CSSD berkurang.",
    quantity: data.quantity,
    fromLabel: getStockPositionLabel(data.from_position),
    toLabel: getStockPositionLabel(data.to_position),
    resultingBalance: data.resulting_balance,
    resultingBalanceLabel: "Sisa stok Siap Pakai",
  };
}

export async function saveInternalUsageAction(
  _previousState: InternalUsageFormState,
  formData: FormData
): Promise<InternalUsageFormState> {
  await requireCssdAccess();

  const itemId = String(formData.get("itemId") ?? "");
  const transactionDate = String(formData.get("transactionDate") ?? "");
  const quantity = String(formData.get("quantity") ?? "");
  const notes = String(formData.get("notes") ?? "");

  const supabase = await createServerSupabaseClient();
  const client = createSupabaseRpcClient(supabase);

  const result = await recordInternalUsage(client, {
    itemId,
    itemType: "CONSUMABLE_INTERNAL",
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
        itemType: "CONSUMABLE_INTERNAL",
        transactionDate,
        quantity,
        notes,
      },
    };
  }

  revalidatePath("/cssd/pemakaian-internal");
  revalidatePath("/cssd/laporan");

  return {
    error: null,
    message: "Pemakaian internal berhasil disimpan.",
    impact: buildInternalUsageImpact(result.data),
  };
}
