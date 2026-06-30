import { describe, expect, it } from "vitest";

import type { ReportQueryClient, ReportView } from "@/lib/cssd/services/reports";
import {
  listCurrentStockReport,
  listItemStockCardReport,
} from "@/lib/cssd/services/reports";

type QueryResult = {
  data: unknown[] | null;
  error: { message: string } | null;
};

function createReportClient(results: Partial<Record<ReportView, QueryResult>>): ReportQueryClient {
  return {
    async findMany<T>(view: ReportView) {
      const result = results[view];

      if (!result) {
        return {
          data: [] as T[],
          error: null,
        };
      }

      return {
        data: (result.data as T[] | null) ?? null,
        error: result.error,
      };
    },
  };
}

describe("cssd report formatting", () => {
  it("uses CSSD as the unit label for internal stock positions without a hospital unit", async () => {
    const client = createReportClient({
      cssd_current_stock_report_v: {
        error: null,
        data: [
          {
            item_id: "item-1",
            item_code: "R-0001",
            item_name: "Set Minor",
            item_type: "REUSABLE",
            stock_position: "READY",
            hospital_unit_id: null,
            hospital_unit_code: null,
            hospital_unit_name: null,
            quantity: 6,
            updated_at: "2026-06-04T00:00:00.000Z",
          },
        ],
      },
    });

    const rows = await listCurrentStockReport(client, {
      itemId: "item-1",
    });

    expect(rows).toEqual([
      expect.objectContaining({
        stockPosition: "READY",
        hospitalUnitId: null,
        hospitalUnitName: "CSSD",
      }),
    ]);
  });

  it("keeps the hospital unit name for unit-owned steps and uses CSSD for internal stock-card steps", async () => {
    const client = createReportClient({
      cssd_item_stock_card_report_v: {
        error: null,
        data: [
          {
            movement_id: "move-1",
            item_id: "item-1",
            item_code: "R-0001",
            item_name: "Set Minor",
            item_type: "REUSABLE",
            movement_type: "REUSABLE_TRANSFER",
            from_position: "NON_STERILE",
            to_position: "STERILIZATION_AREA",
            hospital_unit_id: null,
            hospital_unit_code: null,
            hospital_unit_name: null,
            quantity: 2,
            notes: "Masuk area sterilisasi",
            occurred_at: "2026-06-04T00:00:00.000Z",
            created_at: "2026-06-04T00:00:00.000Z",
          },
          {
            movement_id: "move-2",
            item_id: "item-1",
            item_code: "R-0001",
            item_name: "Set Minor",
            item_type: "REUSABLE",
            movement_type: "RETURN",
            from_position: "IN_UNIT",
            to_position: "NON_STERILE",
            hospital_unit_id: "unit-1",
            hospital_unit_code: "ICU-01",
            hospital_unit_name: "ICU",
            quantity: 2,
            notes: "Kembali dari unit",
            occurred_at: "2026-06-03T00:00:00.000Z",
            created_at: "2026-06-03T00:00:00.000Z",
          },
        ],
      },
    });

    const rows = await listItemStockCardReport(client, {
      itemId: "item-1",
    });

    expect(rows[0]).toMatchObject({
      movementType: "REUSABLE_TRANSFER",
      hospitalUnitId: null,
      hospitalUnitName: "CSSD",
    });
    expect(rows[1]).toMatchObject({
      movementType: "RETURN",
      hospitalUnitId: "unit-1",
      hospitalUnitName: "ICU",
    });
  });
});
