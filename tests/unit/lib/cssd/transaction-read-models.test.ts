import { describe, expect, it } from "vitest";

import {
  listRecentTransactionHistory,
  listReusableProcessingSummary,
  listStockSummary,
} from "@/lib/cssd/services/transaction-read-models";

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

describe("transaction read models", () => {
  it("maps recent transaction history when joined relations are returned as objects", async () => {
    const supabase = createSupabaseStub({
      stock_movements: {
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
            occurred_at: "2026-06-30T00:00:00+00:00",
            items: {
              id: "item-1",
              code: "CSSD-R-0001",
              name: "Gunting",
              item_type: "REUSABLE",
              is_active: true,
            },
            hospital_units: null,
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
        itemCode: "CSSD-R-0001",
        itemName: "Gunting",
        itemType: "REUSABLE",
        quantity: 30,
        destinationLabel: "Steril",
      }),
    ]);
  });

  it("maps stock summary when joined relations are returned as objects", async () => {
    const supabase = createSupabaseStub({
      stock_balances: {
        error: null,
        data: [
          {
            item_id: "item-1",
            stock_position: "READY",
            quantity: 29,
            hospital_unit_id: null,
            items: {
              id: "item-1",
              code: "CSSD-R-0001",
              name: "Gunting",
              item_type: "REUSABLE",
              is_active: true,
            },
            hospital_units: null,
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
        itemCode: "CSSD-R-0001",
        itemName: "Gunting",
        itemType: "REUSABLE",
        stockPosition: "READY",
        stockPositionLabel: "Steril",
        quantity: 29,
      }),
    ]);
  });

  it("aggregates reusable processing summary from non-sterile and sterilization balances", async () => {
    const supabase = createSupabaseStub({
      stock_balances: {
        error: null,
        data: [
          {
            item_id: "item-1",
            stock_position: "NON_STERILE",
            quantity: 3,
            hospital_unit_id: null,
            items: {
              id: "item-1",
              code: "CSSD-R-0001",
              name: "Gunting",
              item_type: "REUSABLE",
              is_active: true,
            },
            hospital_units: null,
          },
          {
            item_id: "item-1",
            stock_position: "STERILIZATION_AREA",
            quantity: 2,
            hospital_unit_id: null,
            items: {
              id: "item-1",
              code: "CSSD-R-0001",
              name: "Gunting",
              item_type: "REUSABLE",
              is_active: true,
            },
            hospital_units: null,
          },
        ],
      },
    });

    const rows = await listReusableProcessingSummary(supabase as never);

    expect(rows).toEqual([
      {
        itemId: "item-1",
        itemName: "Gunting",
        itemCode: "CSSD-R-0001",
        availableNonSterile: 3,
        availableSterilizationArea: 2,
        availableDamaged: 0,
      },
    ]);
  });
});
