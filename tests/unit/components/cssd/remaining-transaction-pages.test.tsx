// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { InternalUsageTransactionView } from "@/components/cssd/transactions/internal-usage-transaction-view";
import { StockOpnameView } from "@/components/cssd/transactions/stock-opname-view";

vi.mock("@/app/(protected)/cssd/pemakaian-internal/actions", () => ({
  initialInternalUsageFormState: {
    error: null,
    message: null,
    impact: null,
  },
  saveInternalUsageAction: vi.fn(),
}));

vi.mock("@/app/(protected)/cssd/stok-opname/actions", () => ({
  initialStockOpnameDraftFormState: {
    error: null,
    message: null,
  },
  initialStockOpnameLineFormState: {
    error: null,
    message: null,
  },
  initialStockOpnameFinalizeFormState: {
    error: null,
    message: null,
  },
  createStockOpnameDraftAction: vi.fn(),
  saveStockOpnameLineAction: vi.fn(),
  finalizeStockOpnameSessionAction: vi.fn(),
}));

const reusableItem = {
  id: "11111111-1111-4111-8111-111111111111",
  code: "R-0001",
  name: "Set Minor",
  item_type: "REUSABLE" as const,
  uom_id: "uom-1",
  notes: null,
  is_active: true,
};

const internalItem = {
  id: "22222222-2222-4222-8222-222222222222",
  code: "CI-0001",
  name: "Chemical Sterilizer",
  item_type: "CONSUMABLE_INTERNAL" as const,
  uom_id: "uom-1",
  notes: null,
  is_active: true,
};

const unitIgd = {
  id: "33333333-3333-4333-8333-333333333333",
  code: "IGD",
  name: "Instalasi Gawat Darurat",
  is_active: true,
};

describe("CSSD remaining transaction pages", () => {
  it("renders internal usage with consumable-internal-only picker and usage history", () => {
    render(
      <InternalUsageTransactionView
        items={[internalItem, reusableItem]}
        recentTransactions={[
          {
            id: "usage-1",
            referenceNo: null,
            transactionDate: "2026-06-29",
            itemName: internalItem.name,
            itemCode: internalItem.code,
            itemType: internalItem.item_type,
            quantity: 2,
            notes: "Pemakaian chemical",
            targetUnitName: null,
            destinationLabel: "Terpakai Internal",
          },
        ]}
        stockSummary={[
          {
            itemId: internalItem.id,
            itemName: internalItem.name,
            itemCode: internalItem.code,
            itemType: internalItem.item_type,
            stockPosition: "READY",
            stockPositionLabel: "Steril",
            quantity: 6,
            hospitalUnitName: null,
          },
        ]}
      />
    );

    expect(
      screen.getByRole("heading", { name: /kelola pemakaian internal cssd/i })
    ).toBeVisible();
    const itemSelect = screen.getByLabelText(/item konsumabel internal/i);
    expect(itemSelect).toHaveTextContent(/chemical sterilizer/i);
    expect(itemSelect).not.toHaveTextContent(/set minor/i);
    expect(screen.getByLabelText(/jumlah pakai/i)).toBeVisible();
    expect(
      screen.getByRole("button", { name: /simpan pemakaian internal/i })
    ).toBeVisible();
  });

  it("renders stock opname draft creation when no active session exists", () => {
    render(
      <StockOpnameView
        items={[internalItem, reusableItem]}
        hospitalUnits={[unitIgd]}
        draftSession={null}
        draftLines={[]}
        recentSessions={[]}
        stockSummary={[]}
      />
    );

    expect(
      screen.getByRole("heading", { name: /kelola stok opname cssd/i })
    ).toBeVisible();
    expect(screen.getByLabelText(/tanggal opname/i)).toBeVisible();
    expect(
      screen.getByRole("button", { name: /buat draft opname/i })
    ).toBeVisible();
  });

  it("renders stock opname line entry and finalize action for active draft", () => {
    render(
      <StockOpnameView
        items={[internalItem, reusableItem]}
        hospitalUnits={[unitIgd]}
        draftSession={{
          id: "44444444-4444-4444-8444-444444444444",
          opnameDate: "2026-06-29",
          status: "DRAFT",
          notes: "Hitung akhir bulan",
          lineCount: 1,
        }}
        draftLines={[
          {
            id: "line-1",
            itemId: reusableItem.id,
            itemName: reusableItem.name,
            itemCode: reusableItem.code,
            itemType: reusableItem.item_type,
            stockPosition: "IN_UNIT",
            stockPositionLabel: "Di Unit",
            hospitalUnitName: unitIgd.name,
            countedQuantity: 3,
            currentQuantity: 2,
            notes: "Selisih satu",
          },
        ]}
        recentSessions={[
          {
            id: "final-1",
            opnameDate: "2026-06-20",
            status: "FINALIZED",
            notes: "Sudah final",
            lineCount: 4,
          },
        ]}
        stockSummary={[
          {
            itemId: reusableItem.id,
            itemName: reusableItem.name,
            itemCode: reusableItem.code,
            itemType: reusableItem.item_type,
            stockPosition: "IN_UNIT",
            stockPositionLabel: "Di Unit",
            quantity: 2,
            hospitalUnitName: unitIgd.name,
          },
        ]}
      />
    );

    expect(screen.getByText(/draft opname aktif/i)).toBeVisible();
    expect(screen.getByLabelText(/item stok/i)).toBeVisible();
    expect(screen.getByLabelText(/posisi stok/i)).toBeVisible();
    expect(screen.getByLabelText(/qty hitung/i)).toBeVisible();
    expect(
      screen.getByRole("button", { name: /simpan baris opname/i })
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: /finalisasi stok opname/i })
    ).toBeVisible();
  });
});
