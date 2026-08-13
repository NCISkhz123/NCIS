"use server";

import { revalidatePath } from "next/cache";

import { requireLaundryAccess } from "@/lib/auth/guards";
import { STOCK_POSITION_LABELS } from "@/lib/laundry/constants";
import type { ReusableProcessingFormState, TransactionImpact } from "@/lib/laundry/forms/transactions";
import { transferReusableStock } from "@/lib/laundry/services/reusable-transfers";
import { createSupabaseRpcClient, type StockMutationResultData } from "@/lib/laundry/services/stock";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function getStockPositionLabel(position: string | null | undefined) {
  if (!position) {
    return null;
  }

  return STOCK_POSITION_LABELS[position as keyof typeof STOCK_POSITION_LABELS];
}

function buildReturnImpact(
  data: StockMutationResultData,
  movementLabel: string,
  resultingBalanceLabel: string
): TransactionImpact {
  return {
    movementLabel,
    quantity: data.quantity,
    fromLabel: getStockPositionLabel(data.from_position),
    toLabel: getStockPositionLabel(data.to_position),
    resultingBalance: data.resulting_balance,
    resultingBalanceLabel,
  };
}

export async function processReturnAction(
  _previousState: ReusableProcessingFormState,
  formData: FormData
): Promise<ReusableProcessingFormState> {
  await requireLaundryAccess();

  const itemId = String(formData.get("itemId") ?? "");
  const returnLineId = String(formData.get("returnLineId") ?? "");
  const quantity = String(formData.get("quantity") ?? "");
  const transactionDate = String(formData.get("transactionDate") ?? "");
  const notes = String(formData.get("notes") ?? "");
  const fromPosition = String(formData.get("fromPosition") ?? "");
  const intent = String(formData.get("intent") ?? "");

  const toPosition =
    intent === "to-sterilization"
      ? "STERILIZATION_AREA"
      : intent === "to-ready"
        ? "READY"
        : "DAMAGED";

  const supabase = await createServerSupabaseClient({
    writeCookies: true,
  });
  const client = createSupabaseRpcClient(supabase);

  // We need to modify transferReusableStock to accept returnLineId
  const result = await transferReusableStock(client, {
    itemId,
    itemType: "REUSABLE",
    quantity,
    fromPosition,
    toPosition,
    transactionDate,
    notes,
    returnLineId: returnLineId || undefined,
  }); // Type cast for now, we will update the service next

  if (!result.success) {
    return {
      error: result.error,
      message: null,
      impact: null,
    };
  }

  revalidatePath("/laundry/area-pembersihan");
  revalidatePath(`/laundry/area-pembersihan/[id]`, 'page');
  revalidatePath("/laundry/pengembalian");
  revalidatePath("/laundry/distribusi");

  return {
    error: null,
    message:
      intent === "to-sterilization"
        ? "Reusable berhasil dipindah ke Area Pencucian."
        : intent === "to-ready"
          ? "Reusable berhasil ditandai Bersih."
          : "Reusable berhasil ditandai Rusak.",
    impact: buildReturnImpact(
      result.data,
      "Perpindahan reusable internal berhasil diproses.",
      `Saldo ${getStockPositionLabel(result.data.to_position) ?? "Bersih"}`
    ),
  };
}
