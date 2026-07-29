// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { SidebarNav } from "@/components/layout/sidebar-nav";

describe("SidebarNav", () => {
  it("auto-expands Master Data when the active route is inside the section", () => {
    render(<SidebarNav pathname="/cssd/master-data/items" />);

    expect(screen.queryByText(/3 menu/i)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/item, satuan, dan unit cssd/i)
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/^buka$/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/^tutup$/i)).not.toBeInTheDocument();
    expect(screen.getByText("Item")).toBeVisible();
    expect(screen.getByText("Satuan")).toBeVisible();
    expect(screen.getByText("Unit")).toBeVisible();
  });

  it("toggles the Master Data submenu when clicked", async () => {
    const user = userEvent.setup();
    render(<SidebarNav pathname="/cssd/pemasukan" />);

    expect(screen.queryByText("Item")).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: /master data/i,
      })
    );

    expect(screen.getByText("Item")).toBeVisible();
    expect(screen.getByText("Satuan")).toBeVisible();
    expect(screen.getByText("Unit")).toBeVisible();

    await user.click(
      screen.getByRole("button", {
        name: /master data/i,
      })
    );

    expect(screen.queryByText("Item")).not.toBeInTheDocument();
  });

  it("auto-expands Laporan when the active route is inside the section", () => {
    render(<SidebarNav pathname="/cssd/laporan/stok-status" />);

    expect(screen.queryByText(/3 menu/i)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/riwayat, posisi stok, dan kartu stok/i)
    ).not.toBeInTheDocument();
    expect(screen.getByText("Riwayat Transaksi")).toBeVisible();
    expect(screen.getByText("Posisi stok")).toBeVisible();
    expect(screen.getByText("Kartu Stok")).toBeVisible();
  });

  it("toggles the Laporan submenu when clicked", async () => {
    const user = userEvent.setup();
    render(<SidebarNav pathname="/cssd/pemasukan" />);

    expect(screen.queryByText("Riwayat Transaksi")).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: /laporan/i,
      })
    );

    expect(screen.getByText("Riwayat Transaksi")).toBeVisible();
    expect(screen.getByText("Posisi stok")).toBeVisible();
    expect(screen.getByText("Kartu Stok")).toBeVisible();

    await user.click(
      screen.getByRole("button", {
        name: /laporan/i,
      })
    );

    expect(screen.queryByText("Riwayat Transaksi")).not.toBeInTheDocument();
  });

  it("hides Master Data for CSSD petugas while keeping reports visible", async () => {
    const user = userEvent.setup();
    render(<SidebarNav pathname="/cssd/pemasukan" role="PETUGAS_CSSD" />);

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

  it("shows Setting for CSSD petugas", () => {
    render(<SidebarNav pathname="/cssd/pemasukan" role="PETUGAS_CSSD" />);

    expect(screen.getByRole("link", { name: /setting/i })).toHaveAttribute(
      "href",
      "/cssd/setting"
    );
  });
});
