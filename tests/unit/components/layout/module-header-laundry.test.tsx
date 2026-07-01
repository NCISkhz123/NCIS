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
        roleLabel="Admin Laundry"
        email="admin.laundry@ncis.local"
        logoutAction={async () => {}}
      />
    );

    expect(
      screen.getByRole("heading", {
        name: "Master Data / Item",
      })
    ).toBeVisible();
    expect(screen.getByText(/kelola daftar item reusable dan linen laundry/i)).toBeVisible();
  });

  it("marks Laundry as the active module in the header selector", () => {
    usePathnameMock.mockReturnValue("/laundry");

    render(
      <ModuleHeader
        roleLabel="Petugas Laundry"
        email="petugas.laundry@ncis.local"
        logoutAction={async () => {}}
      />
    );

    expect(screen.getByRole("link", { name: "Laundry" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(screen.getByRole("link", { name: "CSSD" })).not.toHaveAttribute(
      "aria-current",
      "page"
    );
  });
});
