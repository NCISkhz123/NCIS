import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  createSupabaseAdminClientMock,
  forbiddenMock,
  getCurrentProfileMock,
} = vi.hoisted(() => ({
  createSupabaseAdminClientMock: vi.fn(),
  forbiddenMock: vi.fn(() => {
    throw new Error("FORBIDDEN");
  }),
  getCurrentProfileMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  forbidden: forbiddenMock,
  redirect: vi.fn((target: string) => {
    throw new Error(`REDIRECT:${target}`);
  }),
}));

vi.mock("../../../src/lib/auth/profile", () => ({
  getCurrentProfile: getCurrentProfileMock,
}));

vi.mock("../../../src/lib/supabase/admin", () => ({
  createSupabaseAdminClient: createSupabaseAdminClientMock,
}));

import { createAccountAction } from "../../../src/app/(protected)/setting/actions";

describe("settings actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("forbids petugas from creating accounts before creating an admin client", async () => {
    getCurrentProfileMock.mockResolvedValue({
      email: "petugas.cssd@ncis.local",
      fullName: "Petugas CSSD",
      role: "PETUGAS_CSSD",
      userId: "user-1",
    });

    await expect(createAccountAction(null, new FormData())).rejects.toThrow(
      "FORBIDDEN"
    );

    expect(forbiddenMock).toHaveBeenCalled();
    expect(createSupabaseAdminClientMock).not.toHaveBeenCalled();
  });
});
