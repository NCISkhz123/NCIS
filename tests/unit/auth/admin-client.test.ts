import { beforeEach, describe, expect, it, vi } from "vitest";

const { createClientMock, getPublicEnvMock, getServerEnvMock } = vi.hoisted(
  () => ({
    createClientMock: vi.fn(),
    getPublicEnvMock: vi.fn(),
    getServerEnvMock: vi.fn(),
  })
);

vi.mock("@supabase/supabase-js", () => ({
  createClient: createClientMock,
}));

vi.mock("../../../src/lib/env", () => ({
  getPublicEnv: getPublicEnvMock,
  getServerEnv: getServerEnvMock,
}));

import { createSupabaseAdminClient } from "../../../src/lib/supabase/admin";

describe("createSupabaseAdminClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getPublicEnvMock.mockReturnValue({
      NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
    });
    getServerEnvMock.mockReturnValue({
      SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
    });
  });

  it("disables browser session behavior for service-role clients", () => {
    createClientMock.mockReturnValue({} as never);

    createSupabaseAdminClient();

    expect(createClientMock).toHaveBeenCalledWith(
      "http://127.0.0.1:54321",
      "service-role-key",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
      }
    );
  });
});
