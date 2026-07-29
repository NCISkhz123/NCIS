import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { createServerClientMock, getPublicEnvMock } = vi.hoisted(() => ({
  createServerClientMock: vi.fn(),
  getPublicEnvMock: vi.fn(),
}));

vi.mock("@supabase/ssr", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@supabase/ssr")>();

  return {
    ...actual,
    createServerClient: createServerClientMock,
  };
});

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

  it("redirects CSSD users away from Laundry routes", async () => {
    createServerClientMock.mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: "11111111-1111-1111-1111-111111111111",
            },
          },
        }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: {
                app_role: "ADMIN_CSSD",
              },
              error: null,
            }),
          }),
        }),
      }),
    } as never);

    const response = await updateSession(
      new NextRequest("http://localhost:3000/laundry/pemasukan")
    );

    expect(response.headers.get("location")).toBe("http://localhost:3000/login");
  });

  it("redirects CSSD petugas away from CSSD master data routes", async () => {
    createServerClientMock.mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: "22222222-2222-2222-2222-222222222222",
            },
          },
        }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: {
                app_role: "PETUGAS_CSSD",
              },
              error: null,
            }),
          }),
        }),
      }),
    } as never);

    const response = await updateSession(
      new NextRequest("http://localhost:3000/cssd/master-data/items")
    );

    expect(response.headers.get("location")).toBe("http://localhost:3000/login");
  });

  it("keeps CSSD laporan available for CSSD petugas", async () => {
    createServerClientMock.mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: "22222222-2222-2222-2222-222222222222",
            },
          },
        }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: {
                app_role: "PETUGAS_CSSD",
              },
              error: null,
            }),
          }),
        }),
      }),
    } as never);

    const response = await updateSession(
      new NextRequest("http://localhost:3000/cssd/laporan/stok-status")
    );

    expect(response.headers.get("location")).toBeNull();
  });

  it("clears stale Supabase auth cookies when auth rejects the session", async () => {
    createServerClientMock.mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: null,
          },
          error: {
            name: "AuthApiError",
            message: "Invalid Refresh Token: Refresh Token Not Found",
          },
        }),
      },
      from: vi.fn(),
    } as never);

    const response = await updateSession(
      new NextRequest("http://localhost:3000/login", {
        headers: {
          cookie:
            "sb-127-auth-token.0=stale; sb-ncis-cssd-mvp-auth-token.0=stale",
        },
      })
    );

    const setCookie = response.headers.getSetCookie().join("; ");

    expect(setCookie).toContain("sb-127-auth-token.0=;");
    expect(setCookie).toContain("sb-ncis-cssd-mvp-auth-token.0=;");
    expect(setCookie).toContain("Max-Age=0");
  });
});
