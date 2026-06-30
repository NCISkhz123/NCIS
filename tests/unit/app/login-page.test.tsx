import { beforeEach, describe, expect, it, vi } from "vitest";

const { getCurrentProfileMock, redirectMock } = vi.hoisted(() => ({
  getCurrentProfileMock: vi.fn(),
  redirectMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("../../../src/lib/auth/profile", () => ({
  getCurrentProfile: getCurrentProfileMock,
}));

vi.mock("../../../src/components/auth/login-form", () => ({
  LoginForm: () => null,
}));

vi.mock("../../../src/app/(auth)/login/actions", () => ({
  loginAction: vi.fn(),
}));

import LoginPage from "../../../src/app/(auth)/login/page";

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not redirect authenticated users without CSSD access away from the login page", async () => {
    getCurrentProfileMock.mockResolvedValue({
      email: "user@ncis.local",
      fullName: "User NCIS",
      role: "USER",
      userId: "33333333-3333-3333-3333-333333333333",
    });

    await LoginPage();

    expect(redirectMock).not.toHaveBeenCalled();
  });
});
