// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SidebarNav } from "@/components/layout/sidebar-nav";

describe("SidebarNav for Laundry", () => {
  it("auto-expands Master Data for Laundry routes", () => {
    render(<SidebarNav pathname="/laundry/master-data/items" />);

    expect(screen.getByText("Item")).toBeVisible();
    expect(screen.getByText("Satuan")).toBeVisible();
    expect(screen.getByText("Unit")).toBeVisible();
  });

  it("auto-expands Laporan for Laundry routes", () => {
    render(<SidebarNav pathname="/laundry/laporan/kartu-stok" />);

    expect(screen.getByText("Riwayat Transaksi")).toBeVisible();
    expect(screen.getByText("Stok Status")).toBeVisible();
    expect(screen.getByText("Kartu Stok")).toBeVisible();
  });
});
