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
    const upsertProfile = vi.fn().mockResolvedValue(undefined);

    await ensureDemoUsers({
      adminAuth: {
        findUserByEmail,
        createUser,
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
    const upsertProfile = vi.fn().mockResolvedValue(undefined);

    await ensureDemoUsers({
      adminAuth: {
        findUserByEmail,
        createUser,
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
    expect(upsertProfile).toHaveBeenCalledTimes(2);
  });
});
