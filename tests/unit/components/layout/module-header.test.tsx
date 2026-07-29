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

  it("prefers exact metadata for CSSD report child routes when available", () => {
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
        name: "Riwayat transaksi",
      })
    ).toBeVisible();
    expect(screen.getByText(/cari transaksi lalu ekspor bila diperlukan/i)).toBeVisible();
    expect(screen.queryByText("Pindah Modul")).not.toBeInTheDocument();
    expect(screen.queryByText("Akun")).not.toBeInTheDocument();
    expect(screen.queryByText("NCIS")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: /cssd module/i,
      })
    ).toBeVisible();
    expect(screen.getByRole("button", { name: /logout/i })).toBeVisible();
    expect(screen.getByRole("link", { name: /setting/i })).toHaveAttribute(
      "href",
      "/cssd/setting"
    );
  });

  it("prefers exact metadata for CSSD master data child routes when available", () => {
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
        name: "Data satuan",
      })
    ).toBeVisible();
    expect(screen.getByText(/satuan untuk item dan transaksi cssd/i)).toBeVisible();
  });

  it("prefers exact metadata for the CSSD stock card child route when available", () => {
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
        name: "Kartu stok",
      })
    ).toBeVisible();
    expect(screen.getByText(/telusuri pergerakan satu item/i)).toBeVisible();
  });
});
