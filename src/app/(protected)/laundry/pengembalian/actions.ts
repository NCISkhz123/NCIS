"use server";

import { revalidatePath } from "next/cache";

import { requireLaundryAccess } from "@/lib/auth/guards";
import { STOCK_POSITION_LABELS } from "@/lib/laundry/constants";
import type {
  ReturnFormState,
  ReusableProcessingFormState,
  TransactionImpact,
} from "@/lib/laundry/forms/transactions";
import { transferReusableStock } from "@/lib/laundry/services/reusable-transfers";
import { returnStock } from "@/lib/laundry/services/returns";
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
  await requireLaundryAccess();

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

  revalidatePath("/laundry/pengembalian");

  return {
    error: null,
    message: "Pengembalian reusable berhasil disimpan.",
    impact: buildReturnImpact(
      result.data,
      "Pengembalian tersimpan dan stok reusable diperbarui.",
      `Saldo ${getStockPositionLabel(result.data.to_position) ?? "Kotor"}`
    ),
  };
}

export async function processReusableAction(
  _previousState: ReusableProcessingFormState,
  formData: FormData
): Promise<ReusableProcessingFormState> {
  await requireLaundryAccess();

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

