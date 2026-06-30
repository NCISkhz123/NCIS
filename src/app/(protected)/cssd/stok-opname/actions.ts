"use server";

import { revalidatePath } from "next/cache";

import { requireCssdAccess } from "@/lib/auth/guards";
import {
  createDraftStockOpnameSession,
  finalizeStockOpnameSession,
  saveStockOpnameLine,
} from "@/lib/cssd/services/stock-opname";
import { createSupabaseRpcClient } from "@/lib/cssd/services/stock";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type StockOpnameFeedbackState = {
  error: string | null;
  message: string | null;
  values?: Record<string, string>;
};

export type StockOpnameDraftFormState = StockOpnameFeedbackState;
export type StockOpnameLineFormState = StockOpnameFeedbackState;
export type StockOpnameFinalizeFormState = StockOpnameFeedbackState;

export const initialStockOpnameDraftFormState: StockOpnameDraftFormState = {
  error: null,
  message: null,
};

export const initialStockOpnameLineFormState: StockOpnameLineFormState = {
  error: null,
  message: null,
};

export const initialStockOpnameFinalizeFormState: StockOpnameFinalizeFormState = {
  error: null,
  message: null,
};

function revalidateStockOpnameSurfaces() {
  revalidatePath("/cssd/stok-opname");
  revalidatePath("/cssd/laporan");
  revalidatePath("/cssd/pemasukan");
  revalidatePath("/cssd/distribusi");
  revalidatePath("/cssd/pengembalian");
  revalidatePath("/cssd/pemakaian-internal");
}

export async function createStockOpnameDraftAction(
  _previousState: StockOpnameDraftFormState,
  formData: FormData
): Promise<StockOpnameDraftFormState> {
  await requireCssdAccess();

  const opnameDate = String(formData.get("opnameDate") ?? "");
  const notes = String(formData.get("notes") ?? "");

  const supabase = await createServerSupabaseClient({
    writeCookies: true,
  });
  const client = createSupabaseRpcClient(supabase);
  const result = await createDraftStockOpnameSession(client, {
    opnameDate,
    notes,
  });

  if (!result.success) {
    return {
      error: result.error,
      message: null,
      values: {
        opnameDate,
        notes,
      },
    };
  }

  revalidateStockOpnameSurfaces();

  return {
    error: null,
    message: "Draft stok opname berhasil dibuat.",
  };
}

export async function saveStockOpnameLineAction(
  _previousState: StockOpnameLineFormState,
  formData: FormData
): Promise<StockOpnameLineFormState> {
  await requireCssdAccess();

  const sessionId = String(formData.get("sessionId") ?? "");
  const itemId = String(formData.get("itemId") ?? "");
  const stockPosition = String(formData.get("stockPosition") ?? "");
  const hospitalUnitId = String(formData.get("hospitalUnitId") ?? "");
  const countedQuantity = String(formData.get("countedQuantity") ?? "");
  const notes = String(formData.get("notes") ?? "");

  const supabase = await createServerSupabaseClient({
    writeCookies: true,
  });
  const client = createSupabaseRpcClient(supabase);
  const result = await saveStockOpnameLine(client, sessionId, {
    itemId,
    stockPosition,
    hospitalUnitId: hospitalUnitId || undefined,
    countedQuantity,
    notes,
  });

  if (!result.success) {
    return {
      error: result.error,
      message: null,
      values: {
        sessionId,
        itemId,
        stockPosition,
        hospitalUnitId,
        countedQuantity,
        notes,
      },
    };
  }

  revalidateStockOpnameSurfaces();

  return {
    error: null,
    message: "Baris stok opname berhasil disimpan.",
  };
}

export async function finalizeStockOpnameSessionAction(
  _previousState: StockOpnameFinalizeFormState,
  formData: FormData
): Promise<StockOpnameFinalizeFormState> {
  await requireCssdAccess();

  const sessionId = String(formData.get("sessionId") ?? "");

  const supabase = await createServerSupabaseClient({
    writeCookies: true,
  });
  const client = createSupabaseRpcClient(supabase);
  const result = await finalizeStockOpnameSession(client, sessionId);

  if (!result.success) {
    return {
      error: result.error,
      message: null,
      values: {
        sessionId,
      },
    };
  }

  revalidateStockOpnameSurfaces();

  return {
    error: null,
    message: `Stok opname berhasil difinalisasi. ${result.data.adjusted_lines} baris menimbulkan penyesuaian stok.`,
  };
}
