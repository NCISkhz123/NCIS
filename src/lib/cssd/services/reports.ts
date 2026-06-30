import type { SupabaseClient } from "@supabase/supabase-js";

import { STOCK_POSITION_LABELS } from "@/lib/cssd/constants";
import type { ItemType } from "@/lib/cssd/types";

type StockPosition = keyof typeof STOCK_POSITION_LABELS;
type MovementType =
  | "RECEIPT"
  | "DISTRIBUTION"
  | "RETURN"
  | "REUSABLE_TRANSFER"
  | "INTERNAL_USAGE"
  | "STOCK_OPNAME"
  | "ADJUSTMENT";

type OrderBy = {
  column: string;
  ascending?: boolean;
};

type QueryFilter = {
  column: string;
  operator: "eq" | "gte" | "lte";
  value: unknown;
};

type PersistenceResult<T> = {
  data: T[] | null;
  error: { message: string } | null;
};

export type ReportView =
  | "cssd_current_stock_report_v"
  | "cssd_transaction_history_report_v"
  | "cssd_item_stock_card_report_v";

export type ReportQueryClient = {
  findMany<T>(
    view: ReportView,
    options?: {
      filters?: QueryFilter[];
      orderBy?: OrderBy;
      limit?: number;
    }
  ): Promise<PersistenceResult<T>>;
};

type SupabaseLikeClient = SupabaseClient;

type CurrentStockReportRow = {
  item_id: string;
  item_code: string;
  item_name: string;
  item_type: ItemType;
  stock_position: StockPosition;
  hospital_unit_id: string | null;
  hospital_unit_code: string | null;
  hospital_unit_name: string | null;
  quantity: number;
  updated_at: string;
};

type TransactionHistoryReportRow = {
  movement_id: string;
  item_id: string;
  item_code: string;
  item_name: string;
  item_type: ItemType;
  movement_type: MovementType;
  from_position: StockPosition | null;
  to_position: StockPosition | null;
  hospital_unit_id: string | null;
  hospital_unit_code: string | null;
  hospital_unit_name: string | null;
  quantity: number;
  notes: string | null;
  occurred_at: string;
  created_at: string;
};

export type CurrentStockReportEntry = {
  itemId: string;
  itemCode: string;
  itemName: string;
  itemType: ItemType;
  stockPosition: StockPosition;
  stockPositionLabel: string;
  hospitalUnitId: string | null;
  hospitalUnitCode: string | null;
  hospitalUnitName: string | null;
  quantity: number;
  updatedAt: string;
};

export type TransactionHistoryReportEntry = {
  movementId: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  itemType: ItemType;
  movementType: MovementType;
  movementTypeLabel: string;
  transactionDate: string;
  quantity: number;
  notes: string | null;
  hospitalUnitId: string | null;
  hospitalUnitCode: string | null;
  hospitalUnitName: string | null;
  fromPosition: StockPosition | null;
  fromPositionLabel: string | null;
  toPosition: StockPosition | null;
  toPositionLabel: string | null;
  flowLabel: string;
};

export type ItemStockCardEntry = TransactionHistoryReportEntry;

const MOVEMENT_TYPE_LABELS: Record<MovementType, string> = {
  RECEIPT: "Pemasukan",
  DISTRIBUTION: "Distribusi",
  RETURN: "Pengembalian",
  REUSABLE_TRANSFER: "Perpindahan Reusable",
  INTERNAL_USAGE: "Pemakaian Internal",
  STOCK_OPNAME: "Stock Opname",
  ADJUSTMENT: "Penyesuaian",
};

const CSSD_INTERNAL_POSITIONS = new Set<StockPosition>([
  "READY",
  "NON_STERILE",
  "STERILIZATION_AREA",
]);

function toPositionLabel(position: StockPosition | null) {
  return position ? STOCK_POSITION_LABELS[position] : null;
}

function resolveDisplayUnitName(row: {
  hospital_unit_name: string | null;
  stock_position?: StockPosition | null;
  from_position?: StockPosition | null;
  to_position?: StockPosition | null;
}) {
  if (row.hospital_unit_name) {
    return row.hospital_unit_name;
  }

  if (
    (row.stock_position && CSSD_INTERNAL_POSITIONS.has(row.stock_position)) ||
    (row.from_position && CSSD_INTERNAL_POSITIONS.has(row.from_position)) ||
    (row.to_position && CSSD_INTERNAL_POSITIONS.has(row.to_position))
  ) {
    return "CSSD";
  }

  return null;
}

function buildFlowLabel(row: {
  movement_type: MovementType;
  from_position: StockPosition | null;
  to_position: StockPosition | null;
  hospital_unit_name: string | null;
}) {
  const fromLabel = toPositionLabel(row.from_position);
  const toLabel = toPositionLabel(row.to_position);

  if (row.movement_type === "DISTRIBUTION") {
    return row.hospital_unit_name
      ? `Siap Pakai -> ${row.hospital_unit_name}`
      : "Siap Pakai -> Unit";
  }

  if (row.movement_type === "RETURN") {
    return row.hospital_unit_name
      ? `${row.hospital_unit_name} -> ${toLabel ?? "CSSD"}`
      : `Di Unit -> ${toLabel ?? "CSSD"}`;
  }

  if (fromLabel && toLabel) {
    return `${fromLabel} -> ${toLabel}`;
  }

  if (!fromLabel && toLabel) {
    return `Masuk ke ${toLabel}`;
  }

  if (fromLabel && !toLabel) {
    return `Keluar dari ${fromLabel}`;
  }

  return MOVEMENT_TYPE_LABELS[row.movement_type];
}

function normalizeDateFrom(value?: string) {
  return value ? `${value}T00:00:00.000Z` : undefined;
}

function normalizeDateTo(value?: string) {
  return value ? `${value}T23:59:59.999Z` : undefined;
}

function compareNullableStrings(left: string | null, right: string | null) {
  return (left ?? "").localeCompare(right ?? "");
}

function compareCurrentStock(left: CurrentStockReportEntry, right: CurrentStockReportEntry) {
  return (
    left.itemName.localeCompare(right.itemName) ||
    left.stockPositionLabel.localeCompare(right.stockPositionLabel) ||
    compareNullableStrings(left.hospitalUnitName, right.hospitalUnitName)
  );
}

function compareHistory(
  left: TransactionHistoryReportEntry,
  right: TransactionHistoryReportEntry
) {
  return right.transactionDate.localeCompare(left.transactionDate);
}

export function createSupabaseReportClient(
  supabase: SupabaseLikeClient
): ReportQueryClient {
  return {
    async findMany<T>(
      view: ReportView,
      options?: {
        filters?: QueryFilter[];
        orderBy?: OrderBy;
        limit?: number;
      }
    ) {
      let query = supabase.from(view).select("*");

      for (const filter of options?.filters ?? []) {
        if (filter.value === undefined) {
          continue;
        }

        if (filter.operator === "eq") {
          query =
            filter.value === null
              ? query.is(filter.column, null)
              : query.eq(filter.column, filter.value);
        }

        if (filter.operator === "gte") {
          query = query.gte(filter.column, filter.value);
        }

        if (filter.operator === "lte") {
          query = query.lte(filter.column, filter.value);
        }
      }

      if (options?.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending ?? true,
        });
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      return {
        data: (data as T[] | null) ?? null,
        error: error ? { message: error.message } : null,
      };
    },
  };
}

function mapCurrentStockRow(row: CurrentStockReportRow): CurrentStockReportEntry {
  return {
    itemId: row.item_id,
    itemCode: row.item_code,
    itemName: row.item_name,
    itemType: row.item_type,
    stockPosition: row.stock_position,
    stockPositionLabel: STOCK_POSITION_LABELS[row.stock_position],
    hospitalUnitId: row.hospital_unit_id,
    hospitalUnitCode: row.hospital_unit_code,
    hospitalUnitName: resolveDisplayUnitName(row),
    quantity: row.quantity,
    updatedAt: row.updated_at,
  };
}

function mapHistoryRow(
  row: TransactionHistoryReportRow
): TransactionHistoryReportEntry {
  return {
    movementId: row.movement_id,
    itemId: row.item_id,
    itemCode: row.item_code,
    itemName: row.item_name,
    itemType: row.item_type,
    movementType: row.movement_type,
    movementTypeLabel: MOVEMENT_TYPE_LABELS[row.movement_type],
    transactionDate: row.occurred_at,
    quantity: row.quantity,
    notes: row.notes,
    hospitalUnitId: row.hospital_unit_id,
    hospitalUnitCode: row.hospital_unit_code,
    hospitalUnitName: resolveDisplayUnitName(row),
    fromPosition: row.from_position,
    fromPositionLabel: toPositionLabel(row.from_position),
    toPosition: row.to_position,
    toPositionLabel: toPositionLabel(row.to_position),
    flowLabel: buildFlowLabel(row),
  };
}

export async function listCurrentStockReport(
  client: ReportQueryClient,
  options?: {
    itemId?: string;
    unitId?: string;
    limit?: number;
  }
): Promise<CurrentStockReportEntry[]> {
  const { data, error } = await client.findMany<CurrentStockReportRow>(
    "cssd_current_stock_report_v",
    {
      filters: [
        {
          column: "item_id",
          operator: "eq",
          value: options?.itemId,
        },
        {
          column: "hospital_unit_id",
          operator: "eq",
          value: options?.unitId,
        },
      ],
      orderBy: {
        column: "updated_at",
        ascending: false,
      },
      limit: options?.limit,
    }
  );

  if (error || !data) {
    return [];
  }

  return data.map(mapCurrentStockRow).sort(compareCurrentStock);
}

export async function listTransactionHistoryReport(
  client: ReportQueryClient,
  options?: {
    itemId?: string;
    unitId?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
  }
): Promise<TransactionHistoryReportEntry[]> {
  const { data, error } = await client.findMany<TransactionHistoryReportRow>(
    "cssd_transaction_history_report_v",
    {
      filters: [
        {
          column: "item_id",
          operator: "eq",
          value: options?.itemId,
        },
        {
          column: "hospital_unit_id",
          operator: "eq",
          value: options?.unitId,
        },
        {
          column: "occurred_at",
          operator: "gte",
          value: normalizeDateFrom(options?.dateFrom),
        },
        {
          column: "occurred_at",
          operator: "lte",
          value: normalizeDateTo(options?.dateTo),
        },
      ],
      orderBy: {
        column: "occurred_at",
        ascending: false,
      },
      limit: options?.limit ?? 50,
    }
  );

  if (error || !data) {
    return [];
  }

  return data.map(mapHistoryRow).sort(compareHistory);
}

export async function listItemStockCardReport(
  client: ReportQueryClient,
  options: {
    itemId?: string;
    unitId?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
  }
): Promise<ItemStockCardEntry[]> {
  if (!options.itemId) {
    return [];
  }

  const { data, error } = await client.findMany<TransactionHistoryReportRow>(
    "cssd_item_stock_card_report_v",
    {
      filters: [
        {
          column: "item_id",
          operator: "eq",
          value: options.itemId,
        },
        {
          column: "hospital_unit_id",
          operator: "eq",
          value: options.unitId,
        },
        {
          column: "occurred_at",
          operator: "gte",
          value: normalizeDateFrom(options.dateFrom),
        },
        {
          column: "occurred_at",
          operator: "lte",
          value: normalizeDateTo(options.dateTo),
        },
      ],
      orderBy: {
        column: "occurred_at",
        ascending: false,
      },
      limit: options.limit ?? 100,
    }
  );

  if (error || !data) {
    return [];
  }

  return data.map(mapHistoryRow).sort(compareHistory);
}
