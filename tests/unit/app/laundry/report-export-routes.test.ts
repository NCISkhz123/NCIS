import { beforeEach, describe, expect, it, vi } from "vitest";

const createServerSupabaseClientMock = vi.fn();
const createSupabaseReportClientMock = vi.fn();
const listCurrentStockReportMock = vi.fn();
const listTransactionHistoryReportMock = vi.fn();
const listItemStockCardReportMock = vi.fn();
const buildStockStatusCsvTableMock = vi.fn();
const buildTransactionHistoryCsvTableMock = vi.fn();
const buildStockCardCsvTableMock = vi.fn();
const buildReportCsvFilenameMock = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: createServerSupabaseClientMock,
}));

vi.mock("@/lib/laundry/services/reports", () => ({
  createSupabaseReportClient: createSupabaseReportClientMock,
  listCurrentStockReport: listCurrentStockReportMock,
  listTransactionHistoryReport: listTransactionHistoryReportMock,
  listItemStockCardReport: listItemStockCardReportMock,
}));

vi.mock("@/lib/laundry/reports/csv-export", () => ({
  buildStockStatusCsvTable: buildStockStatusCsvTableMock,
  buildTransactionHistoryCsvTable: buildTransactionHistoryCsvTableMock,
  buildStockCardCsvTable: buildStockCardCsvTableMock,
  buildReportCsvFilename: buildReportCsvFilenameMock,
}));

describe("laundry report export routes", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    createServerSupabaseClientMock.mockResolvedValue({ kind: "supabase" });
    createSupabaseReportClientMock.mockReturnValue({ kind: "report-client" });
    buildReportCsvFilenameMock.mockReturnValue("report.csv");
  });

  it("exports stock status csv using the active filters", async () => {
    listCurrentStockReportMock.mockResolvedValue([{ itemId: "item-1" }]);
    buildStockStatusCsvTableMock.mockReturnValue({
      headers: ["Kode Item", "Qty"],
      rows: [["R-0001", 6]],
    });

    const { GET } = await import(
      "@/app/(protected)/laundry/laporan/stok-status/export/route"
    );
    const response = await GET(
      new Request(
        "http://localhost/laundry/laporan/stok-status/export?stockItem=item-1&stockUnit=unit-1"
      )
    );

    expect(listCurrentStockReportMock).toHaveBeenCalledWith(
      { kind: "report-client" },
      {
        itemId: "item-1",
        unitId: "unit-1",
        limit: 100,
      }
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/csv");
    expect(response.headers.get("content-disposition")).toContain("report.csv");
    expect(await response.text()).toBe("Kode Item,Qty\r\nR-0001,6\r\n");
  });

  it("exports transaction history csv using the active filters", async () => {
    listTransactionHistoryReportMock.mockResolvedValue([{ movementId: "move-1" }]);
    buildTransactionHistoryCsvTableMock.mockReturnValue({
      headers: ["Tanggal", "Qty"],
      rows: [["01 Jul 2026", 2]],
    });

    const { GET } = await import(
      "@/app/(protected)/laundry/laporan/riwayat-transaksi/export/route"
    );
    const response = await GET(
      new Request(
        "http://localhost/laundry/laporan/riwayat-transaksi/export?historyItem=item-1&historyUnit=unit-1&historyFrom=2026-07-01&historyTo=2026-07-02"
      )
    );

    expect(listTransactionHistoryReportMock).toHaveBeenCalledWith(
      { kind: "report-client" },
      {
        itemId: "item-1",
        unitId: "unit-1",
        dateFrom: "2026-07-01",
        dateTo: "2026-07-02",
        limit: 100,
      }
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/csv");
    expect(response.headers.get("content-disposition")).toContain("report.csv");
    expect(await response.text()).toBe("Tanggal,Qty\r\n01 Jul 2026,2\r\n");
  });

  it("exports stock card csv with a fallback filename and header-only body when no item is selected", async () => {
    listItemStockCardReportMock.mockResolvedValue([]);
    buildStockCardCsvTableMock.mockReturnValue({
      headers: ["Tanggal", "Unit"],
      rows: [],
    });

    const { GET } = await import(
      "@/app/(protected)/laundry/laporan/kartu-stok/export/route"
    );
    const response = await GET(
      new Request("http://localhost/laundry/laporan/kartu-stok/export")
    );

    expect(buildReportCsvFilenameMock).toHaveBeenCalledWith("stock-card", {
      date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      itemCode: undefined,
    });
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/csv");
    expect(response.headers.get("content-disposition")).toContain("report.csv");
    expect(await response.text()).toBe("Tanggal,Unit\r\n");
  });
});

