import type { SupabaseClient } from "@supabase/supabase-js";

import { STOCK_POSITION_LABELS } from "@/lib/laundry/constants";
import type { ItemType } from "@/lib/laundry/types";
import type {
  HospitalUnitRow,
  ItemRow,
} from "@/lib/laundry/services/master-data";

type MovementType =
  | "RECEIPT"
  | "DISTRIBUTION"
  | "RETURN"
  | "REUSABLE_TRANSFER"
  | "INTERNAL_USAGE"
  | "STOCK_OPNAME"
  | "ADJUSTMENT";

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

type StockMovementJoinedRow = {
  id: string;
  movement_type: MovementType;
  from_position: keyof typeof STOCK_POSITION_LABELS | null;
  to_position: keyof typeof STOCK_POSITION_LABELS | null;
  hospital_unit_id: string | null;
  quantity: number;
  notes: string | null;
  occurred_at: string;
  laundry_items: JoinedItemRow | JoinedItemRow[] | null;
  laundry_hospital_units: JoinedHospitalUnitRow | JoinedHospitalUnitRow[] | null;
  profiles: { full_name: string | null } | { full_name: string | null }[] | null;
};

type StockBalanceJoinedRow = {
  item_id: string;
  stock_position: keyof typeof STOCK_POSITION_LABELS;
  quantity: number;
  hospital_unit_id: string | null;
  laundry_items: JoinedItemRow | JoinedItemRow[] | null;
  laundry_hospital_units: JoinedHospitalUnitRow | JoinedHospitalUnitRow[] | null;
};

export type TransactionHistoryEntry = {
  id: string;
  referenceNo: string | null;
  transactionDate: string;
  itemName: string;
  itemCode: string;
  itemType: ItemType;
  quantity: number;
  notes: string | null;
  targetUnitName: string | null;
  destinationLabel: string | null;
  movementTypeLabel?: string;
  actorName?: string;
};

export type StockSummaryEntry = {
  itemId: string;
  itemName: string;
  itemCode: string;
  itemType: ItemType;
  stockPosition: keyof typeof STOCK_POSITION_LABELS;
  stockPositionLabel: string;
  quantity: number;
  hospitalUnitId: string | null;
  hospitalUnitName: string | null;
};

export type ReusableProcessingSummaryEntry = {
  itemId: string;
  itemName: string;
  itemCode: string;
  availableNonSterile: number;
  availableSterilizationArea: number;
  availableDamaged: number;
};

function normalizeJoinedRecord<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

export async function listActiveItems(
  supabase: SupabaseClient,
  options?: {
    itemTypes?: ItemType[];
  }
): Promise<ItemRow[]> {
  const { data, error } = await supabase
    .from("laundry_items")
    .select("id, code, name, item_type, uom_id, notes, is_active")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error || !data) {
    return [];
  }

  const rows = data as ItemRow[];

  if (!options?.itemTypes?.length) {
    return rows;
  }

  return rows.filter((item) => options.itemTypes?.includes(item.item_type));
}

export async function listActiveHospitalUnits(
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

export async function listRecentTransactionHistory(
  supabase: SupabaseClient,
  options: {
    movementType: MovementType;
    itemTypes?: ItemType[];
    limit?: number;
  }
): Promise<TransactionHistoryEntry[]> {
  const { data, error } = await supabase
    .from("laundry_stock_movements")
    .select(
      "id, movement_type, from_position, to_position, hospital_unit_id, quantity, notes, occurred_at, laundry_items!inner(id, code, name, item_type, is_active), laundry_hospital_units(name), profiles(full_name)"
    )
    .eq("movement_type", options.movementType)
    .order("occurred_at", { ascending: false })
    .limit(options.limit ?? 8);

  if (error || !data) {
    return [];
  }

  const rows = data as unknown as StockMovementJoinedRow[];

  return rows
    .map((row) => {
      const item = normalizeJoinedRecord(row.laundry_items);
      const hospitalUnit = normalizeJoinedRecord(row.laundry_hospital_units);
      const profile = normalizeJoinedRecord(row.profiles);

      return {
        row,
        item,
        hospitalUnit,
        profile,
      };
    })
    .filter(
      ({ item }) =>
        item &&
        (!options.itemTypes?.length || options.itemTypes.includes(item.item_type))
    )
    .map(({ row, item, hospitalUnit, profile }) => ({
      id: row.id,
      referenceNo: null,
      transactionDate: row.occurred_at,
      itemName: item?.name ?? "-",
      itemCode: item?.code ?? "-",
      itemType: item?.item_type ?? "REUSABLE",
      quantity: row.quantity,
      notes: row.notes,
      targetUnitName: hospitalUnit?.name ?? (row.movement_type === "RECEIPT" || row.movement_type === "RETURN" ? "Laundry" : null),
      destinationLabel: row.to_position
        ? STOCK_POSITION_LABELS[row.to_position]
        : row.movement_type === "DISTRIBUTION"
          ? "Keluar ke Unit"
          : null,
      actorName: profile?.full_name ?? "-",
    }));
}

export async function listStockSummary(
  supabase: SupabaseClient,
  options?: {
    itemTypes?: ItemType[];
    positions?: Array<keyof typeof STOCK_POSITION_LABELS>;
    limit?: number;
  }
): Promise<StockSummaryEntry[]> {
  let query = supabase
    .from("laundry_stock_balances")
    .select(
      "item_id, stock_position, quantity, hospital_unit_id, laundry_items!inner(id, code, name, item_type, is_active), laundry_hospital_units(name)"
    )
    .gt("quantity", 0)
    .order("quantity", { ascending: false })
    .limit(options?.limit ?? 24);

  if (options?.positions?.length) {
    query = query.in("stock_position", options.positions);
  }

  const { data, error } = await query;

  if (error || !data) {
    return [];
  }

  const rows = data as unknown as StockBalanceJoinedRow[];

  return rows
    .map((row) => {
      const item = normalizeJoinedRecord(row.laundry_items);
      const hospitalUnit = normalizeJoinedRecord(row.laundry_hospital_units);

      return {
        row,
        item,
        hospitalUnit,
      };
    })
    .filter(
      ({ item }) =>
        item &&
        item.is_active &&
        (!options?.itemTypes?.length || options.itemTypes.includes(item.item_type))
    )
    .map(({ row, item, hospitalUnit }) => ({
      itemId: row.item_id,
      itemName: item?.name ?? "-",
      itemCode: item?.code ?? "-",
      itemType: item?.item_type ?? "REUSABLE",
      stockPosition: row.stock_position,
      stockPositionLabel: STOCK_POSITION_LABELS[row.stock_position],
      quantity: row.quantity,
      hospitalUnitId: row.hospital_unit_id,
      hospitalUnitName: hospitalUnit?.name ?? null,
    }));
}

export async function listReusableProcessingSummary(
  supabase: SupabaseClient
): Promise<ReusableProcessingSummaryEntry[]> {
  const stockSummary = await listStockSummary(supabase, {
    itemTypes: ["REUSABLE"],
    positions: ["NON_STERILE", "STERILIZATION_AREA", "DAMAGED"],
    limit: 100,
  });

  const summary = new Map<string, ReusableProcessingSummaryEntry>();

  stockSummary.forEach((row) => {
    const current = summary.get(row.itemId) ?? {
      itemId: row.itemId,
      itemName: row.itemName,
      itemCode: row.itemCode,
      availableNonSterile: 0,
      availableSterilizationArea: 0,
      availableDamaged: 0,
    };

    if (row.stockPosition === "NON_STERILE") {
      current.availableNonSterile += row.quantity;
    }

    if (row.stockPosition === "STERILIZATION_AREA") {
      current.availableSterilizationArea += row.quantity;
    }

    if (row.stockPosition === "DAMAGED") {
      current.availableDamaged += row.quantity;
    }

    summary.set(row.itemId, current);
  });

  return Array.from(summary.values()).sort((left, right) =>
    left.itemName.localeCompare(right.itemName)
  );
}

