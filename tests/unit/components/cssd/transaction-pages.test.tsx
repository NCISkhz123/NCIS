// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ReceiptTransactionView } from "@/components/cssd/transactions/receipt-transaction-view";
import { DistributionTransactionView } from "@/components/cssd/transactions/distribution-transaction-view";
import { ReturnTransactionView } from "@/components/cssd/transactions/return-transaction-view";

vi.mock("@/lib/cssd/forms/transactions", () => ({
  initialReceiptFormState: {
    error: null,
    message: null,
    impact: null,
  },
  initialDistributionFormState: {
    error: null,
    message: null,
    impact: null,
  },
  initialReturnFormState: {
    error: null,
    message: null,
    impact: null,
  },
  initialReusableProcessingFormState: {
    error: null,
    message: null,
    impact: null,
  },
}));

vi.mock("@/app/(protected)/cssd/pemasukan/actions", () => ({
  saveReceiptAction: vi.fn(),
}));

vi.mock("@/app/(protected)/cssd/distribusi/actions", () => ({
  saveDistributionAction: vi.fn(),
}));

vi.mock("@/app/(protected)/cssd/pengembalian/actions", () => ({
  saveReturnAction: vi.fn(),
  processReusableAction: vi.fn(),
}));

const reusableItem = {
  id: "11111111-1111-4111-8111-111111111111",
  code: "R-0001",
  name: "Set Minor",
  item_type: "REUSABLE" as const,
  uom_id: "22222222-2222-4222-8222-222222222222",
  notes: null,
  is_active: true,
};

const distributionConsumableItem = {
  id: "33333333-3333-4333-8333-333333333333",
  code: "CD-0001",
  name: "Wrap CSSD",
  item_type: "CONSUMABLE" as const,
  uom_id: "22222222-2222-4222-8222-222222222222",
  notes: null,
  is_active: true,
};

const internalConsumableItem = {
  id: "44444444-4444-4444-8444-444444444444",
  code: "CI-0001",
  name: "Chemical Sterilizer",
  item_type: "CONSUMABLE" as const,
  uom_id: "22222222-2222-4222-8222-222222222222",
  notes: null,
  is_active: true,
};

const hospitalUnit = {
  id: "55555555-5555-4555-8555-555555555555",
  code: "IGD",
  name: "Instalasi Gawat Darurat",
  is_active: true,
};

describe("CSSD transaction pages", () => {
  it("renders the receipt page with form, recent history, and stock detail", () => {
    render(
      <ReceiptTransactionView
        items={[reusableItem, distributionConsumableItem]}
        recentTransactions={[
          {
            id: "receipt-1",
            referenceNo: "RCV-001",
            transactionDate: "2026-06-29",
            itemName: reusableItem.name,
            itemCode: reusableItem.code,
            itemType: reusableItem.item_type,
            quantity: 5,
            notes: "Pemasukan awal",
            targetUnitName: null,
            destinationLabel: "Steril",
          },
        ]}
        stockSummary={[
          {
            itemId: reusableItem.id,
            itemName: reusableItem.name,
            itemCode: reusableItem.code,
            itemType: reusableItem.item_type,
            stockPosition: "READY",
            stockPositionLabel: "Steril",
            quantity: 5,
            hospitalUnitId: "unit-1", hospitalUnitName: null,
          },
        ]}
      />
    );

    expect(screen.getAllByText(/riwayat terbaru/i).length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/tanggal transaksi/i)).toBeVisible();
    expect(screen.getByLabelText(/jumlah masuk/i)).toBeVisible();
    expect(
      screen.getByRole("button", { name: /simpan pemasukan/i })
    ).toBeVisible();
    expect(
      screen.queryByRole("heading", { name: /kelola pemasukan stok cssd/i })
    ).not.toBeInTheDocument();
  });

  it("renders the distribution page with target unit and stock availability", () => {
    render(
      <DistributionTransactionView
        items={[reusableItem, distributionConsumableItem]}
        hospitalUnits={[hospitalUnit]}
        recentTransactions={[
          {
            id: "distribution-1",
            referenceNo: "DST-001",
            transactionDate: "2026-06-29",
            itemName: reusableItem.name,
            itemCode: reusableItem.code,
            itemType: reusableItem.item_type,
            quantity: 3,
            notes: "Distribusi ke IGD",
            targetUnitName: hospitalUnit.name,
            destinationLabel: "Di Unit",
          },
        ]}
        stockSummary={[
          {
            itemId: reusableItem.id,
            itemName: reusableItem.name,
            itemCode: reusableItem.code,
            itemType: reusableItem.item_type,
            stockPosition: "READY",
            stockPositionLabel: "Steril",
            quantity: 8,
            hospitalUnitId: "unit-1", hospitalUnitName: null,
          },
        ]}
      />
    );

    expect(screen.getAllByText(/riwayat terbaru/i).length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/unit tujuan/i)).toBeVisible();
    expect(screen.getByLabelText(/jumlah distribusi/i)).toBeVisible();
    expect(
      screen.getByRole("button", { name: /simpan distribusi/i })
    ).toBeVisible();
    expect(
      screen.queryByRole("heading", { name: /kelola distribusi cssd/i })
    ).not.toBeInTheDocument();
  });

  it("renders the return page with reusable-only options and reusable processing actions", () => {
    render(
      <ReturnTransactionView
        items={[reusableItem, distributionConsumableItem, internalConsumableItem]}
        hospitalUnits={[hospitalUnit]}
        recentTransactions={[
          {
            id: "return-1",
            referenceNo: "RTN-001",
            transactionDate: "2026-06-29",
            itemName: reusableItem.name,
            itemCode: reusableItem.code,
            itemType: reusableItem.item_type,
            quantity: 2,
            notes: "Kembali dari IGD",
            targetUnitName: hospitalUnit.name,
            destinationLabel: "Tidak Steril",
          },
        ]}
        stockSummary={[
          {
            itemId: reusableItem.id,
            itemName: reusableItem.name,
            itemCode: reusableItem.code,
            itemType: reusableItem.item_type,
            stockPosition: "NON_STERILE",
            stockPositionLabel: "Tidak Steril",
            quantity: 2,
            hospitalUnitId: "unit-1", hospitalUnitName: null,
          },
        ]}
        reusableProcessingSummary={[
          {
            itemId: reusableItem.id,
            itemName: reusableItem.name,
            itemCode: reusableItem.code,
            availableNonSterile: 2,
            availableSterilizationArea: 1,
            availableDamaged: 0,
          },
        ]}
      />
    );

    expect(screen.getAllByText(/riwayat terbaru/i).length).toBeGreaterThan(0);

    expect(
      screen.getByRole("button", { name: /simpan pengembalian/i })
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: /tandai steril/i })
    ).toBeVisible();
    expect(
      screen.getAllByRole("button", { name: /tandai rusak/i }).length
    ).toBeGreaterThan(0);
    expect(
      screen.queryByRole("heading", { name: /kelola pengembalian reusable/i })
    ).not.toBeInTheDocument();
  });
});
