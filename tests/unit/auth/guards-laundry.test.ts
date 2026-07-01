import { describe, expect, it } from "vitest";

import {
  decideCssdRouteAccess,
  decideLaundryRouteAccess,
  isLaundryRole,
} from "../../../src/lib/auth/guards";

describe("isLaundryRole", () => {
  it("accepts admin and petugas Laundry roles", () => {
    expect(isLaundryRole("ADMIN_LAUNDRY")).toBe(true);
    expect(isLaundryRole("PETUGAS_LAUNDRY")).toBe(true);
  });

  it("rejects non-Laundry roles", () => {
    expect(isLaundryRole("ADMIN_CSSD")).toBe(false);
    expect(isLaundryRole("USER")).toBe(false);
    expect(isLaundryRole(null)).toBe(false);
  });
});

describe("Laundry and CSSD route decisions stay isolated", () => {
  it("allows Laundry roles into Laundry routes", () => {
    expect(
      decideLaundryRouteAccess({
        pathname: "/laundry/pemasukan",
        userId: "user-1",
        role: "ADMIN_LAUNDRY",
      })
    ).toEqual({
      allowed: true,
    });
  });

  it("denies CSSD roles from Laundry routes", () => {
    expect(
      decideLaundryRouteAccess({
        pathname: "/laundry/distribusi",
        userId: "user-2",
        role: "PETUGAS_CSSD",
      })
    ).toEqual({
      allowed: false,
      redirectTo: "/login",
      reason: "forbidden",
    });
  });

  it("denies Laundry roles from CSSD routes", () => {
    expect(
      decideCssdRouteAccess({
        pathname: "/cssd/pengembalian",
        userId: "user-3",
        role: "PETUGAS_LAUNDRY",
      })
    ).toEqual({
      allowed: false,
      redirectTo: "/login",
      reason: "forbidden",
    });
  });

  it("keeps CSSD routes available for CSSD roles", () => {
    expect(
      decideCssdRouteAccess({
        pathname: "/cssd/stok-opname",
        userId: "user-4",
        role: "ADMIN_CSSD",
      })
    ).toEqual({
      allowed: true,
    });
  });
});
