import { describe, it, expect } from "vitest";
import { resumeSessionInputSchema } from "@/lib/tryout/validators/session";

describe("resumeSessionInputSchema", () => {
  it("parses valid payload with sessionId successfully", () => {
    const validPayload = { sessionId: "sess-123" };
    const result = resumeSessionInputSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validPayload);
    }
  });

  it("fails validation for empty sessionId", () => {
    const invalidPayload = { sessionId: "" };
    const result = resumeSessionInputSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });
});
