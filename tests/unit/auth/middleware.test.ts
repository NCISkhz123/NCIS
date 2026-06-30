import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { createServerClientMock, getPublicEnvMock } = vi.hoisted(() => ({
  createServerClientMock: vi.fn(),
  getPublicEnvMock: vi.fn(),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: createServerClientMock,
}));

vi.mock("../../../src/lib/env", () => ({
  getPublicEnv: getPublicEnvMock,
}));

import { updateSession } from "../../../src/lib/supabase/middleware";

describe("updateSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getPublicEnvMock.mockReturnValue({
      NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
    });
  });

  it("redirects authenticated users without CSSD role away from /cssd routes", async () => {
    createServerClientMock.mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: "33333333-3333-3333-3333-333333333333",
            },
          },
        }),
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

    const response = await updateSession(
      new NextRequest("http://localhost:3000/cssd/pemasukan")
    );

    expect(response.headers.get("location")).toBe("http://localhost:3000/login");
  });
});
