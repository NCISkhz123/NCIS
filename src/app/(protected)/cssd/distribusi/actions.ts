"use server";

import { revalidatePath } from "next/cache";

import { requireCssdAccess } from "@/lib/auth/guards";
import { STOCK_POSITION_LABELS } from "@/lib/cssd/constants";
import { distributeStock } from "@/lib/cssd/services/distributions";
import {
  createSupabaseRpcClient,
  type StockMutationResultData,
} from "@/lib/cssd/services/stock";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type DistributionImpact = {
  movementLabel: string;
  quantity: number;
  fromLabel?: string | null;
  toLabel?: string | null;
  resultingBalance: number;
  resultingBalanceLabel: string;
};

export type DistributionFormState = {
  error: string | null;
  message: string | null;
  impact: DistributionImpact | null;
  values?: {
    itemId?: string;
    itemType?: string;
    targetUnitId?: string;
    transactionDate?: string;
    quantity?: string;
    notes?: string;
  };
};

export const initialDistributionFormState: DistributionFormState = {
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

function buildDistributionImpact(
  data: StockMutationResultData
): DistributionImpact {
  const isReusableFlow = data.to_position === "IN_UNIT";

  return {
    movementLabel: isReusableFlow
      ? "Distribusi reusable tersimpan dan stok unit tujuan bertambah."
      : "Distribusi konsumabel tersimpan dan stok siap pakai CSSD berkurang.",
    quantity: data.quantity,
    fromLabel: getStockPositionLabel(data.from_position),
    toLabel: getStockPositionLabel(data.to_position),
    resultingBalance: data.resulting_balance,
    resultingBalanceLabel: isReusableFlow
      ? "Saldo di Unit Tujuan"
      : "Sisa stok Siap Pakai",
  };
}

export async function saveDistributionAction(
  _previousState: DistributionFormState,
  formData: FormData
): Promise<DistributionFormState> {
  await requireCssdAccess();

  const itemId = String(formData.get("itemId") ?? "");
  const itemType = String(formData.get("itemType") ?? "");
  const targetUnitId = String(formData.get("targetUnitId") ?? "");
  const transactionDate = String(formData.get("transactionDate") ?? "");
  const quantity = String(formData.get("quantity") ?? "");
  const notes = String(formData.get("notes") ?? "");

  const supabase = await createServerSupabaseClient();
  const client = createSupabaseRpcClient(supabase);

  const result = await distributeStock(client, {
    itemId,
    itemType,
    targetUnitId,
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
        targetUnitId,
        transactionDate,
        quantity,
        notes,
      },
    };
  }

  revalidatePath("/cssd/distribusi");
  revalidatePath("/cssd/pengembalian");

  return {
    error: null,
    message: "Distribusi berhasil disimpan.",
    impact: buildDistributionImpact(result.data),
  };
}
