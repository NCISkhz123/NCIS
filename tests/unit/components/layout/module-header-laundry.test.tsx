// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ModuleHeader } from "@/components/layout/module-header";

const usePathnameMock = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => usePathnameMock(),
}));

describe("ModuleHeader for Laundry", () => {
  beforeEach(() => {
    usePathnameMock.mockReset();
  });

  it("shows Laundry metadata for a master data child route", () => {
    usePathnameMock.mockReturnValue("/laundry/master-data/items");

    render(
      <ModuleHeader
        activeModuleKey="LAUNDRY"
        availableModuleKeys={["LAUNDRY", "CSSD"]}
        logoutAction={async () => {}}
      />
    );

    expect(
      screen.getByRole("heading", {
        name: "Data item",
      })
    ).toBeVisible();
    expect(screen.getByText(/item untuk transaksi laundry/i)).toBeVisible();
    expect(
      screen.getByRole("button", { name: /laundry module/i })
    ).toBeVisible();
    expect(screen.getByRole("button", { name: /logout/i })).toBeVisible();
  });

  it("prefers exact metadata for Laundry report child routes when available", () => {
    usePathnameMock.mockReturnValue("/laundry/laporan/stok-status");

    render(
      <ModuleHeader
        activeModuleKey="LAUNDRY"
        availableModuleKeys={["LAUNDRY"]}
        logoutAction={async () => {}}
      />
    );

    expect(
      screen.getByRole("heading", {
        name: "Posisi stok",
      })
    ).toBeVisible();
    expect(screen.getByText(/lihat stok per posisi dan unit/i)).toBeVisible();
  });

  it("marks Laundry as the active module in the utility switcher", () => {
    usePathnameMock.mockReturnValue("/laundry");

    render(
      <ModuleHeader
        activeModuleKey="LAUNDRY"
        availableModuleKeys={["LAUNDRY", "CSSD"]}
        logoutAction={async () => {}}
      />
    );

    expect(
      screen.getByRole("button", { name: /laundry module/i })
    ).toBeVisible();
    expect(screen.queryByText("Pindah Modul")).not.toBeInTheDocument();
    expect(screen.queryByText("Akun")).not.toBeInTheDocument();
  });
});
