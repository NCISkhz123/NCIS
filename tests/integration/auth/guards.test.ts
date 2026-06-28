import { describe, expect, it } from "vitest";

import {
  decideCssdRouteAccess,
  isCssdRole,
} from "../../../src/lib/auth/guards";

describe("isCssdRole", () => {
  it("accepts admin and petugas CSSD roles", () => {
    expect(isCssdRole("ADMIN_CSSD")).toBe(true);
    expect(isCssdRole("PETUGAS_CSSD")).toBe(true);
  });

  it("rejects non-CSSD roles", () => {
    expect(isCssdRole("USER")).toBe(false);
    expect(isCssdRole(null)).toBe(false);
  });
});

describe("decideCssdRouteAccess", () => {
  it("redirects unauthenticated users to login for cssd routes", () => {
    expect(
      decideCssdRouteAccess({
        pathname: "/cssd/master-data/items",
        userId: null,
        role: null,
      })
    ).toEqual({
      allowed: false,
      redirectTo: "/login",
      reason: "unauthenticated",
    });
  });

  it("denies authenticated users without cssd role", () => {
    expect(
      decideCssdRouteAccess({
        pathname: "/cssd/pemasukan",
        userId: "user-1",
        role: "USER",
      })
    ).toEqual({
      allowed: false,
      redirectTo: "/login",
      reason: "forbidden",
    });
  });

  it("allows cssd admins and petugas to access cssd routes", () => {
    expect(
      decideCssdRouteAccess({
        pathname: "/cssd/distribusi",
        userId: "user-1",
        role: "ADMIN_CSSD",
      })
    ).toEqual({
      allowed: true,
    });

    expect(
      decideCssdRouteAccess({
        pathname: "/cssd/pengembalian",
        userId: "user-2",
        role: "PETUGAS_CSSD",
      })
    ).toEqual({
      allowed: true,
    });
  });

  it("ignores non-cssd routes", () => {
    expect(
      decideCssdRouteAccess({
        pathname: "/login",
        userId: null,
        role: null,
      })
    ).toEqual({
      allowed: true,
    });
  });
});
