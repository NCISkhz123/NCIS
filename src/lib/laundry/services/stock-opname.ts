import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import { LAUNDRY_STOCK_POSITION_LABELS } from "@/lib/laundry/constants";
import type { ItemType } from "@/lib/laundry/types";
import type { HospitalUnitRow, ItemRow } from "@/lib/laundry/services/master-data";
import type { LaundryRpcClient, ServiceResult } from "@/lib/laundry/services/stock";
import { stockOpnameDraftSchema, stockOpnameLineSchema } from "@/lib/cssd/validators/stock-opname";

const stockOpnameFinalizeSchema = z.object({
  sessionId: z.string().uuid("Session opname tidak valid"),
});

const stockOpnameLinePayloadSchema = stockOpnameLineSchema.extend({
  sessionId: z.string().uuid("Session opname tidak valid"),
});

type JoinedItemRow = {
  id: string;
  code: string;
  name: string;
  item_type: ItemType;
  is_active: boolean;
};

type JoinedHospitalUnitRow = {
  name: string;
};

type StockOpnameSessionRow = {
  id: string;
  opname_date: string;
  status: "DRAFT" | "FINALIZED";
  notes: string | null;
  scope_type: "GLOBAL" | "INTERNAL" | "UNIT";
  hospital_unit_id: string | null;
  laundry_hospital_units: JoinedHospitalUnitRow[] | null;
  laundry_stock_opname_lines: Array<{ id: string }> | null;
};

type StockOpnameLineJoinedRow = {
  id: string;
  item_id: string;
  stock_position: keyof typeof LAUNDRY_STOCK_POSITION_LABELS;
  hospital_unit_id: string | null;
  counted_quantity: number;
  notes: string | null;
  laundry_items: JoinedItemRow[] | null;
  laundry_hospital_units: JoinedHospitalUnitRow[] | null;
};

type StockOpnameBalanceResponse = number | null;

export type StockOpnameScopeType = "GLOBAL" | "INTERNAL" | "UNIT";

export type StockOpnameSessionSummary = {
  id: string;
  opnameDate: string;
  status: "DRAFT" | "FINALIZED";
  notes: string | null;
  scopeType: StockOpnameScopeType;
  hospitalUnitId: string | null;
  hospitalUnitName: string | null;
  lineCount: number;
};

export type StockOpnameLineSummary = {
  id: string;
  itemId: string;
  itemName: string;
  itemCode: string;
  itemType: ItemType;
  stockPosition: keyof typeof LAUNDRY_STOCK_POSITION_LABELS;
  stockPositionLabel: string;
  hospitalUnitName: string | null;
  countedQuantity: number;
  currentQuantity: number;
  notes: string | null;
};

export type StockOpnameCreateResult = {
  id: string;
  status: "DRAFT";
  opname_date: string;
  notes: string | null;
  hospital_unit_id: string | null;
  line_count: number;
};

export type StockOpnameLineSaveResult = {
  id: string;
  session_id: string;
  item_id: string;
  stock_position: keyof typeof LAUNDRY_STOCK_POSITION_LABELS;
  hospital_unit_id: string | null;
  counted_quantity: number;
  notes: string | null;
};

export type StockOpnameFinalizeResult = {
  id: string;
  status: "FINALIZED";
  opname_date: string;
  adjusted_lines: number;
  total_variance: number;
};

async function executeOpnameRpc<T>(
  client: LaundryRpcClient,
  functionName: string,
  args: Record<string, unknown>
): Promise<ServiceResult<T>> {
  const { data, error } = await client.rpc<T>(functionName, args);

  if (error || !data) {
    return {
      success: false,
      error: error?.message ?? "Operasi stock opname gagal",
    };
  }

  return {
    success: true,
    data,
  };
}

function validationFailure(issues: z.ZodIssue[]): ServiceResult<never> {
  const messages = issues.map((issue) => issue.message);

  return {
    success: false,
    error: messages[0] ?? "Validasi gagal",
    issues: messages,
  };
}

export async function createDraftStockOpnameSession(
  client: LaundryRpcClient,
  input: unknown
): Promise<ServiceResult<StockOpnameCreateResult>> {
  const parsed = stockOpnameDraftSchema.safeParse(input);

  if (!parsed.success) {
    return validationFailure(parsed.error.issues);
  }

  return executeOpnameRpc<StockOpnameCreateResult>(
    client,
    "laundry_create_stock_opname_session",
    {
      p_opname_date: parsed.data.opnameDate.toISOString().slice(0, 10),
      p_notes: parsed.data.notes ?? null,
      p_hospital_unit_id: parsed.data.hospitalUnitId ?? null,
      p_scope_type: parsed.data.scopeType ?? "GLOBAL",
    }
  );
}

export async function saveStockOpnameLine(
  client: LaundryRpcClient,
  sessionId: string,
  input: unknown
): Promise<ServiceResult<StockOpnameLineSaveResult>> {
  const parsed = stockOpnameLinePayloadSchema.safeParse({
    sessionId,
    ...(typeof input === "object" && input ? input : {}),
  });

  if (!parsed.success) {
    return validationFailure(parsed.error.issues);
  }

  return executeOpnameRpc<StockOpnameLineSaveResult>(
    client,
    "laundry_save_stock_opname_line",
    {
      p_session_id: parsed.data.sessionId,
      p_item_id: parsed.data.itemId,
      p_stock_position: parsed.data.stockPosition,
      p_hospital_unit_id: parsed.data.hospitalUnitId ?? null,
      p_counted_quantity: parsed.data.countedQuantity,
      p_notes: parsed.data.notes ?? null,
    }
  );
}

export async function finalizeStockOpnameSession(
  client: LaundryRpcClient,
  sessionId: string
): Promise<ServiceResult<StockOpnameFinalizeResult>> {
  const parsed = stockOpnameFinalizeSchema.safeParse({
    sessionId,
  });

  if (!parsed.success) {
    return validationFailure(parsed.error.issues);
  }

  return executeOpnameRpc<StockOpnameFinalizeResult>(
    client,
    "laundry_finalize_stock_opname_session",
    {
      p_session_id: parsed.data.sessionId,
    }
  );
}

export async function getDraftStockOpnameSession(
  supabase: SupabaseClient
): Promise<StockOpnameSessionSummary | null> {
  const { data, error } = await supabase
    .from("laundry_stock_opname_sessions")
    .select(
      "id, opname_date, status, notes, scope_type, hospital_unit_id, laundry_hospital_units(name), laundry_stock_opname_lines(id)"
    )
    .eq("status", "DRAFT")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const row = data as unknown as StockOpnameSessionRow;

  return {
    id: row.id,
    opnameDate: row.opname_date,
    status: row.status,
    notes: row.notes,
    scopeType: row.scope_type ?? "GLOBAL",
    hospitalUnitId: row.hospital_unit_id ?? null,
    hospitalUnitName: row.laundry_hospital_units?.[0]?.name ?? null,
    lineCount: row.laundry_stock_opname_lines?.length ?? 0,
  };
}

export async function listRecentStockOpnameSessions(
  supabase: SupabaseClient,
  limit = 6
): Promise<StockOpnameSessionSummary[]> {
  const { data, error } = await supabase
    .from("laundry_stock_opname_sessions")
    .select(
      "id, opname_date, status, notes, scope_type, hospital_unit_id, laundry_hospital_units(name), laundry_stock_opname_lines(id)"
    )
    .neq("status", "DRAFT")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return (data as unknown as StockOpnameSessionRow[]).map((row) => ({
    id: row.id,
    opnameDate: row.opname_date,
    status: row.status,
    notes: row.notes,
    scopeType: row.scope_type ?? "GLOBAL",
    hospitalUnitId: row.hospital_unit_id ?? null,
    hospitalUnitName: row.laundry_hospital_units?.[0]?.name ?? null,
    lineCount: row.laundry_stock_opname_lines?.length ?? 0,
  }));
}

async function getCurrentBalance(
  supabase: SupabaseClient,
  itemId: string,
  stockPosition: keyof typeof LAUNDRY_STOCK_POSITION_LABELS,
  hospitalUnitId?: string | null
) {
  const { data, error } = await supabase.rpc("laundry_get_balance", {
    p_item_id: itemId,
    p_stock_position: stockPosition,
    p_hospital_unit_id: hospitalUnitId ?? null,
  });

  if (error) {
    return 0;
  }

  return Number((data as StockOpnameBalanceResponse) ?? 0);
}

export async function listStockOpnameLines(
  supabase: SupabaseClient,
  sessionId: string
): Promise<StockOpnameLineSummary[]> {
  const { data, error } = await supabase
    .from("laundry_stock_opname_lines")
    .select(
      "id, item_id, stock_position, hospital_unit_id, counted_quantity, notes, laundry_items!inner(id, code, name, item_type, is_active), laundry_hospital_units(name)"
    )
    .eq("stock_opname_session_id", sessionId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  const rows = data as unknown as StockOpnameLineJoinedRow[];

  return Promise.all(
    rows.map(async (row) => {
      const item = row.laundry_items?.[0] ?? null;
      const hospitalUnit = row.laundry_hospital_units?.[0] ?? null;
      const currentQuantity = await getCurrentBalance(
        supabase,
        row.item_id,
        row.stock_position,
        row.hospital_unit_id
      );

      return {
        id: row.id,
        itemId: row.item_id,
        itemName: item?.name ?? "-",
        itemCode: item?.code ?? "-",
        itemType: item?.item_type ?? "REUSABLE",
        stockPosition: row.stock_position,
        stockPositionLabel: LAUNDRY_STOCK_POSITION_LABELS[row.stock_position],
        hospitalUnitName: hospitalUnit?.name ?? null,
        countedQuantity: row.counted_quantity,
        currentQuantity,
        notes: row.notes,
      };
    })
  );
}

export async function listAvailableStockOpnameItems(
  supabase: SupabaseClient
): Promise<ItemRow[]> {
  const { data, error } = await supabase
    .from("laundry_items")
    .select("id, code, name, item_type, uom_id, notes, is_active")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data as ItemRow[];
}

export async function listAvailableStockOpnameUnits(
  supabase: SupabaseClient
): Promise<HospitalUnitRow[]> {
  const { data, error } = await supabase
    .from("laundry_hospital_units")
    .select("id, code, name, is_active")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data as HospitalUnitRow[];
}


