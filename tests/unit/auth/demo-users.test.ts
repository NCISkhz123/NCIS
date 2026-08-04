import { describe, expect, it, vi } from "vitest";

import { ensureDemoUsers } from "../../../src/lib/auth/demo-users";

describe("ensureDemoUsers", () => {
  it("creates missing demo users with confirmed email", async () => {
    const findUserByEmail = vi.fn().mockResolvedValue(null);
    const createUser = vi
      .fn()
      .mockResolvedValueOnce({
        id: "11111111-1111-1111-1111-111111111111",
      })
      .mockResolvedValueOnce({
        id: "22222222-2222-2222-2222-222222222222",
      })
      .mockResolvedValueOnce({
        id: "33333333-3333-3333-3333-333333333333",
      })
      .mockResolvedValueOnce({
        id: "44444444-4444-4444-4444-444444444444",
      })
      .mockResolvedValueOnce({
        id: "55555555-5555-5555-5555-555555555555",
      });
    const updateUser = vi.fn().mockResolvedValue(undefined);
    const upsertProfile = vi.fn().mockResolvedValue(undefined);

    await ensureDemoUsers({
      adminAuth: {
        findUserByEmail,
        createUser,
        updateUser,
      },
      profiles: {
        upsertProfile,
      },
      passwords: {
        admin: "secret-admin",
        petugas: "secret-petugas",
      },
    });

    expect(createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "admin.cssd@ncis.local",
        email_confirm: true,
        password: "secret-admin",
      })
    );
    expect(createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "petugas.cssd@ncis.local",
        email_confirm: true,
        password: "secret-petugas",
      })
    );
    expect(createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "admin.laundry@ncis.local",
        email_confirm: true,
        password: "secret-admin",
      })
    );
    expect(createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "petugas.laundry@ncis.local",
        email_confirm: true,
        password: "secret-petugas",
      })
    );
    expect(createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "kepala.seksi@ncis.local",
        email_confirm: true,
        password: "secret-admin",
      })
    );
    expect(updateUser).not.toHaveBeenCalled();
    expect(upsertProfile).toHaveBeenCalledTimes(5);
  });

  it("reuses existing auth users when they are already present", async () => {
    const findUserByEmail = vi
      .fn()
      .mockResolvedValueOnce({
        id: "11111111-1111-1111-1111-111111111111",
      })
      .mockResolvedValueOnce({
        id: "22222222-2222-2222-2222-222222222222",
      })
      .mockResolvedValueOnce({
        id: "33333333-3333-3333-3333-333333333333",
      })
      .mockResolvedValueOnce({
        id: "44444444-4444-4444-4444-444444444444",
      })
      .mockResolvedValueOnce({
        id: "55555555-5555-5555-5555-555555555555",
      });
    const createUser = vi.fn();
    const updateUser = vi.fn().mockResolvedValue(undefined);
    const upsertProfile = vi.fn().mockResolvedValue(undefined);

    await ensureDemoUsers({
      adminAuth: {
        findUserByEmail,
        createUser,
        updateUser,
      },
      profiles: {
        upsertProfile,
      },
      passwords: {
        admin: "secret-admin",
        petugas: "secret-petugas",
      },
    });

    expect(createUser).not.toHaveBeenCalled();
    expect(updateUser).toHaveBeenCalledTimes(5);
    expect(upsertProfile).toHaveBeenCalledTimes(5);
  });

  it("repairs existing demo auth users so bootstrap stays idempotent", async () => {
    const findUserByEmail = vi
      .fn()
      .mockResolvedValueOnce({
        id: "11111111-1111-1111-1111-111111111111",
      })
      .mockResolvedValueOnce({
        id: "22222222-2222-2222-2222-222222222222",
      })
      .mockResolvedValueOnce({
        id: "33333333-3333-3333-3333-333333333333",
      })
      .mockResolvedValueOnce({
        id: "44444444-4444-4444-4444-444444444444",
      })
      .mockResolvedValueOnce({
        id: "55555555-5555-5555-5555-555555555555",
      });
    const createUser = vi.fn();
    const updateUser = vi.fn().mockResolvedValue(undefined);
    const upsertProfile = vi.fn().mockResolvedValue(undefined);

    await ensureDemoUsers({
      adminAuth: {
        findUserByEmail,
        createUser,
        updateUser,
      },
      profiles: {
        upsertProfile,
      },
      passwords: {
        admin: "secret-admin",
        petugas: "secret-petugas",
      },
    } as never);

    expect(createUser).not.toHaveBeenCalled();
    expect(updateUser).toHaveBeenCalledWith(
      "11111111-1111-1111-1111-111111111111",
      expect.objectContaining({
        email_confirm: true,
        password: "secret-admin",
        user_metadata: {
          full_name: "Admin CSSD",
        },
      })
    );
    expect(updateUser).toHaveBeenCalledWith(
      "22222222-2222-2222-2222-222222222222",
      expect.objectContaining({
        email_confirm: true,
        password: "secret-petugas",
        user_metadata: {
          full_name: "Petugas CSSD",
        },
      })
    );
    expect(updateUser).toHaveBeenCalledWith(
      "33333333-3333-3333-3333-333333333333",
      expect.objectContaining({
        email_confirm: true,
        password: "secret-admin",
        user_metadata: {
          full_name: "Admin Laundry",
        },
      })
    );
    expect(updateUser).toHaveBeenCalledWith(
      "44444444-4444-4444-4444-444444444444",
      expect.objectContaining({
        email_confirm: true,
        password: "secret-petugas",
        user_metadata: {
          full_name: "Petugas Laundry",
        },
      })
    );
    expect(updateUser).toHaveBeenCalledWith(
      "55555555-5555-5555-5555-555555555555",
      expect.objectContaining({
        email_confirm: true,
        password: "secret-admin",
        user_metadata: {
          full_name: "Kepala Seksi",
        },
      })
    );
  });
});
