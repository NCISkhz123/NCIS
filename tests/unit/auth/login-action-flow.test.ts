import { beforeEach, describe, expect, it, vi } from "vitest";

const { createServerSupabaseClientMock, redirectMock } = vi.hoisted(() => ({
  createServerSupabaseClientMock: vi.fn(),
  redirectMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("../../../src/lib/supabase/server", () => ({
  createServerSupabaseClient: createServerSupabaseClientMock,
}));

import { loginAction } from "../../../src/app/(auth)/login/actions";

describe("loginAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a friendly error and signs out when the authenticated user has no CSSD access", async () => {
    const signOut = vi.fn().mockResolvedValue({ error: null });

    createServerSupabaseClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: "33333333-3333-3333-3333-333333333333",
            },
          },
        }),
        signInWithPassword: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: "33333333-3333-3333-3333-333333333333",
            },
          },
          error: null,
        }),
        signOut,
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: {
                app_role: "USER",
              },
              error: null,
            }),
          }),
        }),
      }),
    } as never);

    const formData = new FormData();
    formData.set("email", "user@ncis.local");
    formData.set("password", "secret-password");

    const result = await loginAction(null, formData);

    expect(result).toEqual({
      ok: false,
      message: "Akun ini belum memiliki akses modul CSSD.",
    });
    expect(signOut).toHaveBeenCalledTimes(1);
    expect(redirectMock).not.toHaveBeenCalled();
  });
});
