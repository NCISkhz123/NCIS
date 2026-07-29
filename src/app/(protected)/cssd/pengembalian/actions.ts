"use server";

import { revalidatePath } from "next/cache";

import { requireCssdAccess } from "@/lib/auth/guards";
import type {
  ReturnFormState,
  ReusableProcessingFormState,
  TransactionImpact,
} from "@/lib/cssd/forms/transactions";
import { STOCK_POSITION_LABELS } from "@/lib/cssd/constants";
import { transferReusableStock } from "@/lib/cssd/services/reusable-transfers";
import { returnStock } from "@/lib/cssd/services/returns";
import {
  createSupabaseRpcClient,
  type StockMutationResultData,
} from "@/lib/cssd/services/stock";
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

export async function saveReturnAction(
  _previousState: ReturnFormState,
  formData: FormData
): Promise<ReturnFormState> {
  await requireCssdAccess();

  const itemId = String(formData.get("itemId") ?? "");
  const sourceUnitId = String(formData.get("sourceUnitId") ?? "");
  const destinationPosition = String(formData.get("destinationPosition") ?? "");
  const transactionDate = String(formData.get("transactionDate") ?? "");
  const quantity = String(formData.get("quantity") ?? "");
  const notes = String(formData.get("notes") ?? "");

  const supabase = await createServerSupabaseClient({
    writeCookies: true,
  });
  const client = createSupabaseRpcClient(supabase);

  const result = await returnStock(client, {
    itemId,
    itemType: "REUSABLE",
    sourceUnitId,
    destinationPosition,
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
        sourceUnitId,
        destinationPosition,
        transactionDate,
        quantity,
        notes,
      },
    };
  }

  revalidatePath("/cssd/pengembalian");

  return {
    error: null,
    message: "Pengembalian reusable berhasil disimpan.",
    impact: buildReturnImpact(
      result.data,
      "Pengembalian tersimpan dan stok reusable diperbarui.",
      `Saldo ${getStockPositionLabel(result.data.to_position) ?? "Tidak Steril"}`
    ),
  };
}

export async function processReusableAction(
  _previousState: ReusableProcessingFormState,
  formData: FormData
): Promise<ReusableProcessingFormState> {
  await requireCssdAccess();

  const itemId = String(formData.get("itemId") ?? "");
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
  });

  if (!result.success) {
    return {
      error: result.error,
      message: null,
      impact: null,
    };
  }

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
