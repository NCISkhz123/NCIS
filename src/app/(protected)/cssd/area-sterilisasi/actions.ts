"use server";

import { revalidatePath } from "next/cache";

import { requireCssdAccess } from "@/lib/auth/guards";
import { STOCK_POSITION_LABELS } from "@/lib/cssd/constants";
import type { ReusableProcessingFormState, TransactionImpact } from "@/lib/cssd/forms/transactions";
import { transferReusableStock } from "@/lib/cssd/services/reusable-transfers";
import { createSupabaseRpcClient, type StockMutationResultData } from "@/lib/cssd/services/stock";
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
  await requireCssdAccess();

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

  const result = await transferReusableStock(client, {
    itemId,
    itemType: "REUSABLE",
    quantity,
    fromPosition,
    toPosition,
    transactionDate,
    notes,
    returnLineId: returnLineId || undefined,
  });

  if (!result.success) {
    return {
      error: result.error,
      message: null,
      impact: null,
    };
  }

  revalidatePath("/cssd/area-sterilisasi");
  revalidatePath(`/cssd/area-sterilisasi/[id]`, 'page');
  revalidatePath("/cssd/pengembalian");
  revalidatePath("/cssd/distribusi");

  return {
    error: null,
    message:
      intent === "to-sterilization"
        ? "Reusable berhasil dipindah ke Area Sterilisasi."
        : intent === "to-ready"
          ? "Reusable berhasil ditandai Steril."
          : "Reusable berhasil ditandai Rusak.",
    impact: buildReturnImpact(
      result.data,
      "Perpindahan reusable internal berhasil diproses.",
      `Saldo ${getStockPositionLabel(result.data.to_position) ?? "Steril"}`
    ),
  };
}
