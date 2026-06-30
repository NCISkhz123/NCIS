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
    expect(updateUser).not.toHaveBeenCalled();
    expect(upsertProfile).toHaveBeenCalledTimes(2);
  });

  it("reuses existing auth users when they are already present", async () => {
    const findUserByEmail = vi
      .fn()
      .mockResolvedValueOnce({
        id: "11111111-1111-1111-1111-111111111111",
      })
      .mockResolvedValueOnce({
        id: "22222222-2222-2222-2222-222222222222",
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
    expect(updateUser).toHaveBeenCalledTimes(2);
    expect(upsertProfile).toHaveBeenCalledTimes(2);
  });

  it("repairs existing demo auth users so bootstrap stays idempotent", async () => {
    const findUserByEmail = vi
      .fn()
      .mockResolvedValueOnce({
        id: "11111111-1111-1111-1111-111111111111",
      })
      .mockResolvedValueOnce({
        id: "22222222-2222-2222-2222-222222222222",
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
  });
});
