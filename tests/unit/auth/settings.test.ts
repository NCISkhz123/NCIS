import { describe, expect, it, vi } from "vitest";

import {
  createManagedAccount,
  getCreatableRolesForAdmin,
  updateOwnName,
  updateOwnPassword,
} from "../../../src/lib/auth/settings";

describe("getCreatableRolesForAdmin", () => {
  it("limits CSSD admins to CSSD account roles", () => {
    expect(getCreatableRolesForAdmin("ADMIN_CSSD")).toEqual([
      "ADMIN_CSSD",
      "PETUGAS_CSSD",
    ]);
  });

  it("limits Laundry admins to Laundry account roles", () => {
    expect(getCreatableRolesForAdmin("ADMIN_LAUNDRY")).toEqual([
      "ADMIN_LAUNDRY",
      "PETUGAS_LAUNDRY",
    ]);
  });

  it("returns no creatable roles for petugas", () => {
    expect(getCreatableRolesForAdmin("PETUGAS_CSSD")).toEqual([]);
    expect(getCreatableRolesForAdmin("PETUGAS_LAUNDRY")).toEqual([]);
  });
});

describe("updateOwnName", () => {
  it("updates the current user's profile name", async () => {
    const update = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });
    const supabase = {
      from: vi.fn().mockReturnValue({ update }),
    };

    const result = await updateOwnName(supabase, {
      userId: "user-1",
      fullName: "Nama Baru",
    });

    expect(result).toEqual({ success: true });
    expect(supabase.from).toHaveBeenCalledWith("profiles");
    expect(update).toHaveBeenCalledWith({ full_name: "Nama Baru" });
  });
});

describe("updateOwnPassword", () => {
  it("updates the current user's password", async () => {
    const updateUser = vi.fn().mockResolvedValue({ error: null });

    const result = await updateOwnPassword(
      { auth: { updateUser } },
      { password: "password-baru" }
    );

    expect(result).toEqual({ success: true });
    expect(updateUser).toHaveBeenCalledWith({ password: "password-baru" });
  });
});

describe("createManagedAccount", () => {
  it("creates an auth user and profile for same-module roles", async () => {
    const createUser = vi.fn().mockResolvedValue({
      data: { user: { id: "new-user-id" } },
      error: null,
    });
    const upsert = vi.fn().mockResolvedValue({ error: null });
    const supabase = {
      auth: { admin: { createUser } },
      from: vi.fn().mockReturnValue({ upsert }),
    };

    const result = await createManagedAccount(supabase, "ADMIN_CSSD", {
      email: "baru.cssd@ncis.local",
      fullName: "User CSSD",
      password: "password-baru",
      role: "PETUGAS_CSSD",
    });

    expect(result).toEqual({ success: true });
    expect(createUser).toHaveBeenCalledWith({
      email: "baru.cssd@ncis.local",
      password: "password-baru",
      email_confirm: true,
      user_metadata: {
        full_name: "User CSSD",
      },
    });
    expect(upsert).toHaveBeenCalledWith(
      {
        user_id: "new-user-id",
        email: "baru.cssd@ncis.local",
        full_name: "User CSSD",
        app_role: "PETUGAS_CSSD",
        is_active: true,
      },
      { onConflict: "email" }
    );
  });

  it("rolls back the auth user when profile creation fails", async () => {
    const createUser = vi.fn().mockResolvedValue({
      data: { user: { id: "new-user-id" } },
      error: null,
    });
    const deleteUser = vi.fn().mockResolvedValue({ error: null });
    const upsert = vi.fn().mockResolvedValue({
      error: { message: "profile insert failed" },
    });
    const supabase = {
      auth: { admin: { createUser, deleteUser } },
      from: vi.fn().mockReturnValue({ upsert }),
    };

    const result = await createManagedAccount(supabase, "ADMIN_CSSD", {
      email: "baru.cssd@ncis.local",
      fullName: "User CSSD",
      password: "password-baru",
      role: "PETUGAS_CSSD",
    });

    expect(result).toEqual({
      success: false,
      error: "profile insert failed",
    });
    expect(deleteUser).toHaveBeenCalledWith("new-user-id");
  });

  it("rejects cross-module account creation", async () => {
    const createUser = vi.fn();
    const supabase = {
      auth: { admin: { createUser } },
      from: vi.fn(),
    };

    const result = await createManagedAccount(supabase, "ADMIN_CSSD", {
      email: "baru.laundry@ncis.local",
      fullName: "User Laundry",
      password: "password-baru",
      role: "PETUGAS_LAUNDRY",
    });

    expect(result).toEqual({
      success: false,
      error: "Role akun tidak sesuai dengan modul admin.",
    });
    expect(createUser).not.toHaveBeenCalled();
  });
});
