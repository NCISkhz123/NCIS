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

  it("uses deterministic fallback metadata for CSSD report child routes", () => {
    usePathnameMock.mockReturnValue("/cssd/laporan/riwayat-transaksi");

    render(
      <ModuleHeader
        activeModuleKey="CSSD"
        availableModuleKeys={["CSSD", "LAUNDRY"]}
        logoutAction={async () => {}}
      />
    );

    expect(
      screen.getByRole("heading", {
        name: "Laporan",
      })
    ).toBeVisible();
    expect(screen.getByText(/lihat laporan cssd/i)).toBeVisible();
    expect(screen.queryByText("Pindah Modul")).not.toBeInTheDocument();
    expect(screen.queryByText("Akun")).not.toBeInTheDocument();
    expect(screen.queryByText("NCIS")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: /cssd module/i,
      })
    ).toBeVisible();
    expect(screen.getByRole("button", { name: /logout/i })).toBeVisible();
  });

  it("uses deterministic fallback metadata for CSSD master data child routes", () => {
    usePathnameMock.mockReturnValue("/cssd/master-data/satuan");

    render(
      <ModuleHeader
        activeModuleKey="CSSD"
        availableModuleKeys={["CSSD"]}
        logoutAction={async () => {}}
      />
    );

    expect(
      screen.getByRole("heading", {
        name: "Data item",
      })
    ).toBeVisible();
    expect(screen.getByText(/item untuk transaksi cssd/i)).toBeVisible();
  });

  it("uses deterministic fallback metadata for the CSSD stock card child route", () => {
    usePathnameMock.mockReturnValue("/cssd/laporan/kartu-stok");

    render(
      <ModuleHeader
        activeModuleKey="CSSD"
        availableModuleKeys={["CSSD"]}
        logoutAction={async () => {}}
      />
    );

    expect(
      screen.getByRole("heading", {
        name: "Laporan",
      })
    ).toBeVisible();
    expect(screen.getByText(/lihat laporan cssd/i)).toBeVisible();
  });
});
