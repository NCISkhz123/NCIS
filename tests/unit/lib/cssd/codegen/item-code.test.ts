import { describe, expect, it } from "vitest";

import { generateItemCode } from "@/lib/cssd/codegen/item-code";

describe("generateItemCode", () => {
  it("generates a formatted code for reusable items", () => {
    expect(generateItemCode({ itemType: "REUSABLE", sequence: 1 })).toBe(
      "CSSD-R-0001"
    );
  });

  it("uses a different prefix for consumable internal items", () => {
    expect(
      generateItemCode({ itemType: "CONSUMABLE", sequence: 27 })
    ).toBe("CSSD-C-0027");
  });
});
