import { describe, expect, it } from "vitest";

import { itemFormSchema } from "@/lib/cssd/validators/item";

describe("itemFormSchema", () => {
  it("accepts blank item code so it can be auto-generated later", () => {
    const result = itemFormSchema.safeParse({
      code: "",
      itemType: "REUSABLE",
      name: "Set Instrumen Mayor",
      uomId: "11111111-1111-4111-8111-111111111111",
    });

    expect(result.success).toBe(true);
  });

  it("accepts manual code overrides", () => {
    const result = itemFormSchema.safeParse({
      code: "CSSD-R-0099",
      itemType: "REUSABLE",
      name: "Set Minor",
      uomId: "11111111-1111-4111-8111-111111111111",
    });

    expect(result.success).toBe(true);
  });
});
