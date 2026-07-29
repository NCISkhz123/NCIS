import { describe, expect, it } from "vitest";

import type { ReportQueryClient, ReportView } from "@/lib/laundry/services/reports";
import {
  listItemStockCardReport,
  listTransactionHistoryReport,
} from "@/lib/laundry/services/reports";

type CapturedQuery = {
  view: ReportView;
  options?: {
    filters?: Array<{
      column: string;
      operator: "eq" | "gte" | "lte";
      value: unknown;
    }>;
    orderBy?: { column: string; ascending?: boolean };
    limit?: number;
  };
};

function createCapturingClient() {
  const calls: CapturedQuery[] = [];

  const client: ReportQueryClient = {
    async findMany<T>(
      view: ReportView,
      options?: CapturedQuery["options"]
    ) {
      calls.push({ view, options });

      return {
        data: [] as T[],
        error: null,
      };
    },
  };

  return { client, calls };
}

describe("laundry report query defaults", () => {
  it("limits transaction history by default", async () => {
    const { client, calls } = createCapturingClient();

    await listTransactionHistoryReport(client, {
      itemId: "item-1",
      unitId: "unit-1",
      dateFrom: "2026-07-01",
      dateTo: "2026-07-03",
    });

    expect(calls).toHaveLength(1);
    expect(calls[0]?.options).toMatchObject({
      orderBy: {
        column: "occurred_at",
        ascending: false,
      },
    });
    expect(calls[0]?.options?.limit).toBe(50);
  });

  it("limits stock card queries by default", async () => {
    const { client, calls } = createCapturingClient();

    await listItemStockCardReport(client, {
      itemId: "item-1",
      unitId: "unit-1",
      dateFrom: "2026-07-01",
      dateTo: "2026-07-03",
    });

    expect(calls).toHaveLength(1);
    expect(calls[0]?.options).toMatchObject({
      orderBy: {
        column: "occurred_at",
        ascending: false,
      },
    });
    expect(calls[0]?.options?.limit).toBe(100);
  });
});
