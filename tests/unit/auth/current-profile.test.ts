import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../src/lib/supabase/server", () => ({
  createServerSupabaseClient: vi.fn(),
}));

import { getCurrentProfile } from "../../../src/lib/auth/profile";
import { createServerSupabaseClient } from "../../../src/lib/supabase/server";

describe("getCurrentProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reads role and name from public.profiles for the authenticated user", async () => {
    vi.mocked(createServerSupabaseClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: "11111111-1111-1111-1111-111111111111",
              email: "admin.cssd@ncis.local",
            },
          },
        }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: {
                email: "admin.cssd@ncis.local",
                full_name: "Admin CSSD",
                app_role: "ADMIN_CSSD",
              },
              error: null,
            }),
          }),
        }),
      }),
    } as never);

    const profile = await getCurrentProfile();

    expect(profile).toEqual({
      email: "admin.cssd@ncis.local",
      fullName: "Admin CSSD",
      role: "ADMIN_CSSD",
      userId: "11111111-1111-1111-1111-111111111111",
    });
  });
});
