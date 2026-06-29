import { describe, expect, it, vi } from "vitest";

import {
  loginWithPassword,
  normalizeLoginPayload,
} from "../../../src/app/(auth)/login/actions";

describe("normalizeLoginPayload", () => {
  it("rejects empty email and password", () => {
    expect(() => normalizeLoginPayload(new FormData())).toThrow(
      "Email tidak valid"
    );
  });
});

describe("loginWithPassword", () => {
  it("returns a friendly error when Supabase rejects the credentials", async () => {
    const signInWithPassword = vi.fn().mockResolvedValue({
      error: { message: "Invalid login credentials" },
    });

    const result = await loginWithPassword(
      {
        auth: {
          signInWithPassword,
        },
      },
      {
        email: "admin.cssd@ncis.local",
        password: "wrong-password",
      }
    );

    expect(result).toEqual({
      ok: false,
      message: "Email atau password tidak sesuai.",
    });
  });

  it("returns ok when Supabase accepts the credentials", async () => {
    const signInWithPassword = vi.fn().mockResolvedValue({
      error: null,
    });

    const result = await loginWithPassword(
      {
        auth: {
          signInWithPassword,
        },
      },
      {
        email: "admin.cssd@ncis.local",
        password: "correct-password",
      }
    );

    expect(result).toEqual({
      ok: true,
    });
  });
});
