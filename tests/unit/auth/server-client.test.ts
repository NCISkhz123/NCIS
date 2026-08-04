import { beforeEach, describe, expect, it, vi } from "vitest";

const { createServerClientMock, cookiesMock } = vi.hoisted(() => ({
  createServerClientMock: vi.fn(),
  cookiesMock: vi.fn(),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: createServerClientMock,
}));

vi.mock("next/headers", () => ({
  cookies: cookiesMock,
}));

vi.mock("../../../src/lib/env", () => ({
  getPublicEnv: vi.fn(() => ({
    NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
  })),
}));

import { createServerSupabaseClient } from "../../../src/lib/supabase/server";

describe("createServerSupabaseClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("registers a suppressed setAll cookie write for read-only server rendering", async () => {
    const cookieStore = {
      getAll: vi.fn().mockReturnValue([]),
      set: vi.fn(),
    };

    cookiesMock.mockResolvedValue(cookieStore);
    createServerClientMock.mockReturnValue({} as never);

    await createServerSupabaseClient();

    const options = createServerClientMock.mock.calls[0]?.[2];

    expect(options.cookies.getAll()).toEqual([]);
    expect(options.cookies.setAll).toBeTypeOf("function");
  });

  it("uses an app-specific auth cookie name instead of the localhost default", async () => {
    const cookieStore = {
      getAll: vi.fn().mockReturnValue([]),
      set: vi.fn(),
    };

    cookiesMock.mockResolvedValue(cookieStore);
    createServerClientMock.mockReturnValue({} as never);

    await createServerSupabaseClient();

    const options = createServerClientMock.mock.calls[0]?.[2];

    expect(options.cookieOptions.name).toBe("sb-ncis-cssd-mvp-auth-token");
  });
});
