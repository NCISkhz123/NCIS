import { describe, expect, it } from "vitest";

import { getAvailableModuleKeys } from "@/lib/auth/module-availability";

describe("getAvailableModuleKeys", () => {
  it("returns CSSD only for CSSD roles", () => {
    expect(getAvailableModuleKeys("ADMIN_CSSD")).toEqual(["CSSD"]);
    expect(getAvailableModuleKeys("PETUGAS_CSSD")).toEqual(["CSSD"]);
  });

  it("returns Laundry only for Laundry roles", () => {
    expect(getAvailableModuleKeys("ADMIN_LAUNDRY")).toEqual(["LAUNDRY"]);
    expect(getAvailableModuleKeys("PETUGAS_LAUNDRY")).toEqual(["LAUNDRY"]);
  });

  it("returns no modules for unknown app users", () => {
    expect(getAvailableModuleKeys("USER")).toEqual([]);
    expect(getAvailableModuleKeys(null)).toEqual([]);
  });
});
