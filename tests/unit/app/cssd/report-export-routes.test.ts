import { beforeEach, describe, expect, it, vi } from "vitest";

const createServerSupabaseClientMock = vi.fn();
const createSupabaseReportClientMock = vi.fn();
const listCurrentStockReportMock = vi.fn();
const listTransactionHistoryReportMock = vi.fn();
const listItemStockCardReportMock = vi.fn();
const buildStockStatusExcelTableMock = vi.fn();
const buildTransactionHistoryExcelTableMock = vi.fn();
const buildStockCardExcelTableMock = vi.fn();
const buildReportExcelFilenameMock = vi.fn();
const buildExcelBufferMock = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: createServerSupabaseClientMock,
}));

vi.mock("@/lib/cssd/services/reports", () => ({
  createSupabaseReportClient: createSupabaseReportClientMock,
  listCurrentStockReport: listCurrentStockReportMock,
  listTransactionHistoryReport: listTransactionHistoryReportMock,
  listItemStockCardReport: listItemStockCardReportMock,
}));

vi.mock("@/lib/cssd/reports/excel-export", () => ({
  buildStockStatusExcelTable: buildStockStatusExcelTableMock,
  buildTransactionHistoryExcelTable: buildTransactionHistoryExcelTableMock,
  buildStockCardExcelTable: buildStockCardExcelTableMock,
  buildReportExcelFilename: buildReportExcelFilenameMock,
}));

vi.mock("@/lib/excel", () => ({
  buildExcelBuffer: buildExcelBufferMock,
}));

describe("cssd report export routes", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    createServerSupabaseClientMock.mockResolvedValue({ kind: "supabase" });
    createSupabaseReportClientMock.mockReturnValue({ kind: "report-client" });
    buildReportExcelFilenameMock.mockReturnValue("report.xlsx");
    buildExcelBufferMock.mockResolvedValue(Buffer.from("dummy-excel"));
  });

  it("exports stock status csv using the active filters", async () => {
    listCurrentStockReportMock.mockResolvedValue([{ itemId: "item-1" }]);
    const mockTable = { headers: ["A"], rows: [["B"]] };
    buildStockStatusExcelTableMock.mockReturnValue(mockTable);

    const { GET } = await import(
      "@/app/(protected)/cssd/laporan/stok-status/export/route"
    );
    const response = await GET(
      new Request(
        "http://localhost/cssd/laporan/stok-status/export?stockItem=item-1&stockUnit=unit-1"
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
    expect(response.headers.get("content-type")).toContain("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    expect(response.headers.get("content-disposition")).toContain("report.xlsx");
    expect(buildExcelBufferMock).toHaveBeenCalledWith(mockTable);
  });

  it("exports transaction history csv using the active filters", async () => {
    listTransactionHistoryReportMock.mockResolvedValue([{ movementId: "move-1" }]);
    const mockTable = { headers: ["A"], rows: [["B"]] };
    buildTransactionHistoryExcelTableMock.mockReturnValue(mockTable);

    const { GET } = await import(
      "@/app/(protected)/cssd/laporan/riwayat-transaksi/export/route"
    );
    const response = await GET(
      new Request(
        "http://localhost/cssd/laporan/riwayat-transaksi/export?historyItem=item-1&historyUnit=unit-1&historyFrom=2026-07-01&historyTo=2026-07-02"
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
    expect(response.headers.get("content-type")).toContain("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    expect(response.headers.get("content-disposition")).toContain("report.xlsx");
    expect(buildExcelBufferMock).toHaveBeenCalledWith(mockTable);
  });

  it("exports stock card csv with a fallback filename and header-only body when no item is selected", async () => {
    listItemStockCardReportMock.mockResolvedValue([]);
    const mockTable = { headers: ["A"], rows: [] };
    buildStockCardExcelTableMock.mockReturnValue(mockTable);

    const { GET } = await import(
      "@/app/(protected)/cssd/laporan/kartu-stok/export/route"
    );
    const response = await GET(
      new Request("http://localhost/cssd/laporan/kartu-stok/export")
    );

    expect(buildReportExcelFilenameMock).toHaveBeenCalledWith("stock-card", {
      date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      itemCode: undefined,
    });
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    expect(response.headers.get("content-disposition")).toContain("report.xlsx");
    expect(buildExcelBufferMock).toHaveBeenCalledWith(mockTable);
  });
});

