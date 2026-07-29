import { describe, expect, it } from "vitest";

import {
  decideCssdRouteAccess,
  decideLaundryRouteAccess,
  isCssdRole,
  isLaundryRole,
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

  it("denies cssd petugas from master data routes while keeping reports available", () => {
    expect(
      decideCssdRouteAccess({
        pathname: "/cssd/master-data/items",
        userId: "user-2",
        role: "PETUGAS_CSSD",
      })
    ).toEqual({
      allowed: false,
      redirectTo: "/login",
      reason: "forbidden",
    });

    expect(
      decideCssdRouteAccess({
        pathname: "/cssd/laporan/stok-status",
        userId: "user-2",
        role: "PETUGAS_CSSD",
      })
    ).toEqual({
      allowed: true,
    });
  });

  it("allows cssd admins to access master data routes", () => {
    expect(
      decideCssdRouteAccess({
        pathname: "/cssd/master-data/items",
        userId: "user-1",
        role: "ADMIN_CSSD",
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

describe("decideLaundryRouteAccess", () => {
  it("redirects unauthenticated users to login for laundry routes", () => {
    expect(
      decideLaundryRouteAccess({
        pathname: "/laundry/master-data/items",
        userId: null,
        role: null,
      })
    ).toEqual({
      allowed: false,
      redirectTo: "/login",
      reason: "unauthenticated",
    });
  });

  it("denies authenticated CSSD users from Laundry routes", () => {
    expect(
      decideLaundryRouteAccess({
        pathname: "/laundry/pemasukan",
        userId: "user-1",
        role: "ADMIN_CSSD",
      })
    ).toEqual({
      allowed: false,
      redirectTo: "/login",
      reason: "forbidden",
    });
  });

  it("allows Laundry users to access Laundry routes", () => {
    expect(
      decideLaundryRouteAccess({
        pathname: "/laundry/distribusi",
        userId: "user-2",
        role: "PETUGAS_LAUNDRY",
      })
    ).toEqual({
      allowed: true,
    });
  });

  it("denies Laundry petugas from master data routes while keeping reports available", () => {
    expect(
      decideLaundryRouteAccess({
        pathname: "/laundry/master-data/items",
        userId: "user-2",
        role: "PETUGAS_LAUNDRY",
      })
    ).toEqual({
      allowed: false,
      redirectTo: "/login",
      reason: "forbidden",
    });

    expect(
      decideLaundryRouteAccess({
        pathname: "/laundry/laporan/stok-status",
        userId: "user-2",
        role: "PETUGAS_LAUNDRY",
      })
    ).toEqual({
      allowed: true,
    });
  });

  it("allows Laundry admins to access master data routes", () => {
    expect(
      decideLaundryRouteAccess({
        pathname: "/laundry/master-data/items",
        userId: "user-1",
        role: "ADMIN_LAUNDRY",
      })
    ).toEqual({
      allowed: true,
    });
  });
});
