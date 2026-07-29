// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const createServerSupabaseClientMock = vi.fn();
const createSupabaseReportClientMock = vi.fn();
const listActiveItemsMock = vi.fn();
const listActiveHospitalUnitsMock = vi.fn();
const listCurrentStockReportMock = vi.fn();
const listTransactionHistoryReportMock = vi.fn();
const listItemStockCardReportMock = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: createServerSupabaseClientMock,
}));

vi.mock("@/lib/cssd/services/reports", () => ({
  createSupabaseReportClient: createSupabaseReportClientMock,
  listCurrentStockReport: listCurrentStockReportMock,
  listTransactionHistoryReport: listTransactionHistoryReportMock,
  listItemStockCardReport: listItemStockCardReportMock,
}));

vi.mock("@/lib/cssd/services/transaction-read-models", () => ({
  listActiveItems: listActiveItemsMock,
  listActiveHospitalUnits: listActiveHospitalUnitsMock,
}));

describe("cssd report page export links", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    createServerSupabaseClientMock.mockResolvedValue({ kind: "supabase" });
    createSupabaseReportClientMock.mockReturnValue({ kind: "report-client" });
    listActiveItemsMock.mockResolvedValue([
      {
        id: "item-1",
        code: "R-0001",
        name: "Set Minor",
        item_type: "REUSABLE",
        uom_id: "uom-1",
        notes: null,
        is_active: true,
      },
    ]);
    listActiveHospitalUnitsMock.mockResolvedValue([
      {
        id: "unit-1",
        code: "ICU-01",
        name: "ICU",
        is_active: true,
      },
    ]);
    listCurrentStockReportMock.mockResolvedValue([]);
    listTransactionHistoryReportMock.mockResolvedValue([]);
    listItemStockCardReportMock.mockResolvedValue([]);
  });

  it("renders the stock status export link with active filters", async () => {
    const pageModule = await import(
      "@/app/(protected)/cssd/laporan/stok-status/page"
    );

    render(
      await pageModule.default({
        searchParams: Promise.resolve({
          stockItem: "item-1",
          stockUnit: "unit-1",
        }),
      })
    );

    const exportLink = screen.getByRole("link", { name: /ekspor csv/i });
    expect(exportLink.getAttribute("href")).toBe(
      "/cssd/laporan/stok-status/export?stockItem=item-1&stockUnit=unit-1"
    );
  });

  it("renders the transaction history export link with active filters", async () => {
    const pageModule = await import(
      "@/app/(protected)/cssd/laporan/riwayat-transaksi/page"
    );

    render(
      await pageModule.default({
        searchParams: Promise.resolve({
          historyItem: "item-1",
          historyUnit: "unit-1",
          historyFrom: "2026-07-01",
          historyTo: "2026-07-03",
        }),
      })
    );

    const exportLink = screen.getByRole("link", { name: /ekspor csv/i });
    expect(exportLink.getAttribute("href")).toBe(
      "/cssd/laporan/riwayat-transaksi/export?historyItem=item-1&historyUnit=unit-1&historyFrom=2026-07-01&historyTo=2026-07-03"
    );
  });

  it("disables stock card export when no item is selected", async () => {
    const pageModule = await import(
      "@/app/(protected)/cssd/laporan/kartu-stok/page"
    );

    render(
      await pageModule.default({
        searchParams: Promise.resolve({}),
      })
    );

    expect(
      screen.getByRole("button", { name: /ekspor csv/i })
    ).toBeDisabled();
  });

  it("renders the stock card export link when an item is selected", async () => {
    const pageModule = await import(
      "@/app/(protected)/cssd/laporan/kartu-stok/page"
    );

    render(
      await pageModule.default({
        searchParams: Promise.resolve({
          cardItem: "item-1",
          cardUnit: "unit-1",
          cardFrom: "2026-07-01",
          cardTo: "2026-07-03",
        }),
      })
    );

    const exportLink = screen.getByRole("link", { name: /ekspor csv/i });
    expect(exportLink.getAttribute("href")).toBe(
      "/cssd/laporan/kartu-stok/export?cardItem=item-1&cardUnit=unit-1&cardFrom=2026-07-01&cardTo=2026-07-03"
    );
  });
});
