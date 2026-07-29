import { describe, expect, it } from "vitest";

import {
  listRecentTransactionHistory,
  listReusableProcessingSummary,
  listStockSummary,
} from "@/lib/laundry/services/transaction-read-models";

type QueryResult = {
  data: unknown[] | null;
  error: { message: string } | null;
};

function createQueryBuilder(result: QueryResult) {
  const builder = {
    select() {
      return builder;
    },
    eq() {
      return builder;
    },
    gt() {
      return builder;
    },
    in() {
      return builder;
    },
    order() {
      return builder;
    },
    limit() {
      return builder;
    },
    then(resolve: (value: QueryResult) => unknown) {
      return Promise.resolve(resolve(result));
    },
  };

  return builder;
}

function createSupabaseStub(results: Record<string, QueryResult>) {
  return {
    from(table: string) {
      const result = results[table];

      if (!result) {
        throw new Error(`Missing stub for table ${table}`);
      }

      return createQueryBuilder(result);
    },
  };
}

describe("laundry transaction read models", () => {
  it("maps recent transaction history when joined relations are returned as objects", async () => {
    const supabase = createSupabaseStub({
      laundry_stock_movements: {
        error: null,
        data: [
          {
            id: "move-1",
            movement_type: "RECEIPT",
            from_position: null,
            to_position: "READY",
            hospital_unit_id: null,
            quantity: 30,
            notes: "Pemasukan awal",
            occurred_at: "2026-07-01T00:00:00+00:00",
            laundry_items: {
              id: "item-1",
              code: "LAUNDRY-R-0001",
              name: "Linen Bed",
              item_type: "REUSABLE",
              is_active: true,
            },
            laundry_hospital_units: null,
          },
        ],
      },
    });

    const rows = await listRecentTransactionHistory(supabase as never, {
      movementType: "RECEIPT",
      limit: 8,
    });

    expect(rows).toEqual([
      expect.objectContaining({
        id: "move-1",
        itemCode: "LAUNDRY-R-0001",
        itemName: "Linen Bed",
        itemType: "REUSABLE",
        quantity: 30,
        destinationLabel: "Bersih",
      }),
    ]);
  });

  it("maps stock summary when joined relations are returned as objects", async () => {
    const supabase = createSupabaseStub({
      laundry_stock_balances: {
        error: null,
        data: [
          {
            item_id: "item-1",
            stock_position: "READY",
            quantity: 29,
            hospital_unit_id: null,
            laundry_items: {
              id: "item-1",
              code: "LAUNDRY-R-0001",
              name: "Linen Bed",
              item_type: "REUSABLE",
              is_active: true,
            },
            laundry_hospital_units: null,
          },
        ],
      },
    });

    const rows = await listStockSummary(supabase as never, {
      positions: ["READY"],
      limit: 12,
    });

    expect(rows).toEqual([
      expect.objectContaining({
        itemId: "item-1",
        itemCode: "LAUNDRY-R-0001",
        itemName: "Linen Bed",
        itemType: "REUSABLE",
        stockPosition: "READY",
        stockPositionLabel: "Bersih",
        quantity: 29,
      }),
    ]);
  });

  it("aggregates reusable processing summary from object-shaped join rows", async () => {
    const supabase = createSupabaseStub({
      laundry_stock_balances: {
        error: null,
        data: [
          {
            item_id: "item-1",
            stock_position: "NON_STERILE",
            quantity: 3,
            hospital_unit_id: null,
            laundry_items: {
              id: "item-1",
              code: "LAUNDRY-R-0001",
              name: "Linen Bed",
              item_type: "REUSABLE",
              is_active: true,
            },
            laundry_hospital_units: null,
          },
          {
            item_id: "item-1",
            stock_position: "STERILIZATION_AREA",
            quantity: 2,
            hospital_unit_id: null,
            laundry_items: {
              id: "item-1",
              code: "LAUNDRY-R-0001",
              name: "Linen Bed",
              item_type: "REUSABLE",
              is_active: true,
            },
            laundry_hospital_units: null,
          },
        ],
      },
    });

    const rows = await listReusableProcessingSummary(supabase as never);

    expect(rows).toEqual([
      {
        itemId: "item-1",
        itemName: "Linen Bed",
        itemCode: "LAUNDRY-R-0001",
        availableNonSterile: 3,
        availableSterilizationArea: 2,
        availableDamaged: 0,
      },
    ]);
  });
});
