import { describe, expect, it } from "vitest";

import { getAvailableModuleKeys } from "@/lib/auth/module-availability";

describe("getAvailableModuleKeys", () => {
  it("returns CSSD and Laundry for CSSD roles", () => {
    expect(getAvailableModuleKeys("ADMIN_CSSD")).toEqual(["CSSD", "LAUNDRY"]);
    expect(getAvailableModuleKeys("PETUGAS_CSSD")).toEqual(["CSSD", "LAUNDRY"]);
  });

  it("returns CSSD and Laundry for Laundry roles", () => {
    expect(getAvailableModuleKeys("ADMIN_LAUNDRY")).toEqual(["CSSD", "LAUNDRY"]);
    expect(getAvailableModuleKeys("PETUGAS_LAUNDRY")).toEqual(["CSSD", "LAUNDRY"]);
  });

  it("returns CSSD and Laundry for USER role but only AMBULANCE for Ambulance roles", () => {
    expect(getAvailableModuleKeys("USER")).toEqual(["CSSD", "LAUNDRY"]);
    expect(getAvailableModuleKeys("ADMIN_AMBULANCE")).toEqual(["AMBULANCE"]);
    expect(getAvailableModuleKeys("PETUGAS_AMBULANCE")).toEqual(["AMBULANCE"]);
  });

  it("returns no modules for null app users", () => {
    expect(getAvailableModuleKeys(null)).toEqual([]);
  });
});
