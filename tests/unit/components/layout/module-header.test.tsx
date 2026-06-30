// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ModuleHeader } from "@/components/layout/module-header";

const usePathnameMock = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => usePathnameMock(),
}));

describe("ModuleHeader", () => {
  beforeEach(() => {
    usePathnameMock.mockReset();
  });

  it("shows report child metadata for the transaction history page", () => {
    usePathnameMock.mockReturnValue("/cssd/laporan/riwayat-transaksi");

    render(
      <ModuleHeader roleLabel="Admin CSSD" email="admin@example.com" logoutAction={async () => {}} />
    );

    expect(
      screen.getByRole("heading", {
        name: "Laporan / Riwayat Transaksi",
      })
    ).toBeVisible();
    expect(
      screen.getByText(/filter item, unit, dan tanggal/i)
    ).toBeVisible();
  });

  it("shows report child metadata for the stock status page", () => {
    usePathnameMock.mockReturnValue("/cssd/laporan/stok-status");

    render(
      <ModuleHeader roleLabel="Admin CSSD" email="admin@example.com" logoutAction={async () => {}} />
    );

    expect(
      screen.getByRole("heading", {
        name: "Laporan / Stok Status",
      })
    ).toBeVisible();
    expect(screen.getByText(/saldo aktif cssd/i)).toBeVisible();
  });

  it("shows report child metadata for the stock card page", () => {
    usePathnameMock.mockReturnValue("/cssd/laporan/kartu-stok");

    render(
      <ModuleHeader roleLabel="Admin CSSD" email="admin@example.com" logoutAction={async () => {}} />
    );

    expect(
      screen.getByRole("heading", {
        name: "Laporan / Kartu Stok",
      })
    ).toBeVisible();
    expect(screen.getByText(/jejak perpindahan item cssd/i)).toBeVisible();
  });
});
