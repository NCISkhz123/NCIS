// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SettingsView } from "@/components/settings/settings-view";

const profile = {
  email: "admin.cssd@ncis.local",
  fullName: "Admin CSSD",
  role: "ADMIN_CSSD" as const,
  userId: "user-1",
};

describe("SettingsView", () => {
  it("renders profile, password, and logout controls for all module roles", () => {
    render(
      <SettingsView
        profile={{ ...profile, role: "PETUGAS_CSSD" }}
        updateNameAction={vi.fn()}
        updatePasswordAction={vi.fn()}
        createAccountAction={vi.fn()}
        logoutAction={vi.fn()}
      />
    );

    expect(screen.getByRole("heading", { name: /setting/i })).toBeVisible();
    expect(screen.getByLabelText(/nama/i)).toHaveValue("Admin CSSD");
    expect(screen.getByLabelText(/password baru/i)).toBeVisible();
    expect(screen.getByRole("button", { name: /logout/i })).toBeVisible();
    expect(
      screen.queryByRole("heading", { name: /pembuatan akun/i })
    ).not.toBeInTheDocument();
  });

  it("renders account creation for admins with same-module role options", () => {
    render(
      <SettingsView
        profile={profile}
        updateNameAction={vi.fn()}
        updatePasswordAction={vi.fn()}
        createAccountAction={vi.fn()}
        logoutAction={vi.fn()}
      />
    );

    expect(
      screen.getByRole("heading", { name: /pembuatan akun/i })
    ).toBeVisible();
    expect(screen.getByRole("option", { name: "Admin CSSD" })).toBeVisible();
    expect(screen.getByRole("option", { name: "Petugas CSSD" })).toBeVisible();
    expect(
      screen.queryByRole("option", { name: "Admin Laundry" })
    ).not.toBeInTheDocument();
  });
});
