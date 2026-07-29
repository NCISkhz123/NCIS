// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { SidebarNav } from "@/components/layout/sidebar-nav";

describe("SidebarNav for Laundry", () => {
  it("auto-expands Master Data for Laundry routes", () => {
    render(<SidebarNav pathname="/laundry/master-data/items" />);

    expect(screen.queryByText(/3 menu/i)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/item, satuan, dan unit laundry/i)
    ).not.toBeInTheDocument();
    expect(screen.getByText("Item")).toBeVisible();
    expect(screen.getByText("Satuan")).toBeVisible();
    expect(screen.getByText("Unit")).toBeVisible();
  });

  it("auto-expands Laporan for Laundry routes", () => {
    render(<SidebarNav pathname="/laundry/laporan/kartu-stok" />);

    expect(screen.queryByText(/3 menu/i)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/riwayat, posisi stok, dan kartu stok/i)
    ).not.toBeInTheDocument();
    expect(screen.getByText("Riwayat Transaksi")).toBeVisible();
    expect(screen.getByText("Posisi stok")).toBeVisible();
    expect(screen.getByText("Kartu Stok")).toBeVisible();
  });

  it("hides Master Data for Laundry petugas while keeping reports visible", async () => {
    const user = userEvent.setup();
    render(<SidebarNav pathname="/laundry/pemasukan" role="PETUGAS_LAUNDRY" />);

    expect(
      screen.queryByRole("button", {
        name: /master data/i,
      })
    ).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: /laporan/i,
      })
    );

    expect(screen.getByText("Riwayat Transaksi")).toBeVisible();
    expect(screen.getByText("Posisi stok")).toBeVisible();
    expect(screen.getByText("Kartu Stok")).toBeVisible();
  });

  it("shows Setting for Laundry petugas", () => {
    render(<SidebarNav pathname="/laundry/pemasukan" role="PETUGAS_LAUNDRY" />);

    expect(screen.getByRole("link", { name: /setting/i })).toHaveAttribute(
      "href",
      "/laundry/setting"
    );
  });
});
