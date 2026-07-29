import { describe, it, expect } from "vitest";
import { resumeTryoutSessionAction } from "@/app/(protected)/tryout/actions";
import { createMockSession } from "@/lib/tryout/services/session";

describe("resumeTryoutSessionAction", () => {
  it("resumes an active session successfully via server action", async () => {
    const session = createMockSession({
      id: "sess-action-test",
      startedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 50).toISOString(),
      status: "IN_PROGRESS",
    });

    const result = await resumeTryoutSessionAction(session.id);
    expect(result.status).toBe("ACTIVE");
    if (result.status === "ACTIVE") {
      expect(result.session.id).toBe(session.id);
      expect(result.remainingSeconds).toBeGreaterThan(0);
    }
  });

  it("handles empty session ID gracefully returning ERROR status", async () => {
    const result = await resumeTryoutSessionAction("");
    expect(result.status).toBe("ERROR");
    if (result.status === "ERROR") {
      expect(result.error).toBeDefined();
      expect(typeof result.error).toBe("string");
    }
  });
});
