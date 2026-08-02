"use server";

import { revalidatePath } from "next/cache";

import { requireLaundryAccess } from "@/lib/auth/guards";
import { getCurrentProfile } from "@/lib/auth/profile";
import type {
  StockOpnameDraftFormState,
  StockOpnameFinalizeFormState,
  StockOpnameLineFormState,
} from "@/lib/laundry/forms/transactions";
import {
  createDraftStockOpnameSession,
  finalizeStockOpnameSession,
  saveStockOpnameLine,
  submitDraftStockOpnameSession,
  rejectPendingStockOpnameSession,
} from "@/lib/laundry/services/stock-opname";
import { createSupabaseRpcClient } from "@/lib/laundry/services/stock";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function revalidateStockOpnameSurfaces() {
  revalidatePath("/laundry/stok-opname");
  revalidatePath("/laundry/laporan");
  revalidatePath("/laundry/pemasukan");
  revalidatePath("/laundry/distribusi");
  revalidatePath("/laundry/pengembalian");
  revalidatePath("/laundry/pemakaian-internal");
}

export async function createStockOpnameDraftAction(
  _previousState: StockOpnameDraftFormState,
  formData: FormData
): Promise<StockOpnameDraftFormState> {
  await requireLaundryAccess();

  const opnameDate = String(formData.get("opnameDate") ?? "");
  const notes = String(formData.get("notes") ?? "");
  const scopeSelection = String(formData.get("hospitalUnitId") ?? "");

  let scopeType: "GLOBAL" | "INTERNAL" | "UNIT" = "GLOBAL";
  let hospitalUnitId: string | null = null;

  if (scopeSelection === "INTERNAL") {
    scopeType = "INTERNAL";
  } else if (scopeSelection) {
    scopeType = "UNIT";
    hospitalUnitId = scopeSelection;
  }

  const supabase = await createServerSupabaseClient({
    writeCookies: true,
  });
  const client = createSupabaseRpcClient(supabase);
  const result = await createDraftStockOpnameSession(client, {
    opnameDate,
    notes,
    scopeType,
    hospitalUnitId,
  });

  if (!result.success) {
    return {
      error: result.error,
      message: null,
      values: {
        opnameDate,
        notes,
        scopeType,
        hospitalUnitId: scopeSelection,
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
  await requireLaundryAccess();

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
  await requireLaundryAccess();

  const sessionId = String(formData.get("sessionId") ?? "");

  const supabase = await createServerSupabaseClient({
    writeCookies: true,
  });
  
  const profile = await getCurrentProfile();
  const isChecker = profile?.role === "ADMIN_LAUNDRY" || profile?.role === "KEPALA_SEKSI";
  if (!isChecker) {
    return {
      error: "Hanya Supervisor yang dapat memfinalisasi",
      message: null,
      values: {
        sessionId,
      },
    };
  }

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

export async function submitStockOpnameDraftAction(
  _previousState: StockOpnameFinalizeFormState,
  formData: FormData
): Promise<StockOpnameFinalizeFormState> {
  await requireLaundryAccess();

  const sessionId = String(formData.get("sessionId") ?? "");

  const supabase = await createServerSupabaseClient({
    writeCookies: true,
  });
  const client = createSupabaseRpcClient(supabase);
  const result = await submitDraftStockOpnameSession(client, sessionId);

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
    message: "Draft stok opname berhasil diajukan untuk persetujuan.",
  };
}

export async function rejectStockOpnamePendingAction(
  _previousState: StockOpnameFinalizeFormState,
  formData: FormData
): Promise<StockOpnameFinalizeFormState> {
  await requireLaundryAccess();

  const sessionId = String(formData.get("sessionId") ?? "");

  const supabase = await createServerSupabaseClient({
    writeCookies: true,
  });
  const client = createSupabaseRpcClient(supabase);
  const result = await rejectPendingStockOpnameSession(client, sessionId);

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
    message: "Stok opname dikembalikan ke DRAFT.",
  };
}

