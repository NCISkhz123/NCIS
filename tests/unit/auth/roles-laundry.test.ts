import { describe, expect, it } from "vitest";

import { normalizeRole } from "../../../src/lib/auth/roles";

describe("normalizeRole for laundry roles", () => {
  it("accepts admin and petugas laundry roles", () => {
    expect(normalizeRole("ADMIN_LAUNDRY")).toBe("ADMIN_LAUNDRY");
    expect(normalizeRole("PETUGAS_LAUNDRY")).toBe("PETUGAS_LAUNDRY");
  });

  it("still rejects unknown roles", () => {
    expect(normalizeRole("LAUNDRY")).toBeNull();
  });
});
