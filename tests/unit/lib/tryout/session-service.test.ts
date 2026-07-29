import { describe, it, expect } from "vitest";
import { resumeTryoutSession, createMockSession } from "@/lib/tryout/services/session";

describe("Tryout Session Service", () => {
  it("returns ACTIVE status with remaining seconds when session is within valid duration", async () => {
    const now = new Date("2026-07-29T10:00:00Z");
    const session = createMockSession({
      id: "sess-active",
      startedAt: "2026-07-29T09:30:00Z",
      expiresAt: "2026-07-29T10:30:00Z", // 30 mins remaining
      durationSeconds: 3600,
      status: "IN_PROGRESS",
    });

    const result = await resumeTryoutSession(session.id, now, session);
    expect(result.status).toBe("ACTIVE");
    if (result.status === "ACTIVE") {
      expect(result.remainingSeconds).toBe(1800);
      expect(result.session).toEqual(session);
    }
  });

  it("returns EXPIRED status and auto-submits when current time exceeds expiresAt", async () => {
    const now = new Date("2026-07-29T11:00:00Z"); // 30 mins after expiration
    const session = createMockSession({
      id: "sess-expired",
      startedAt: "2026-07-29T09:00:00Z",
      expiresAt: "2026-07-29T10:30:00Z",
      durationSeconds: 5400,
      status: "IN_PROGRESS",
    });

    const result = await resumeTryoutSession(session.id, now, session);
    expect(result.status).toBe("EXPIRED");
    if (result.status === "EXPIRED") {
      expect(result.sessionId).toBe(session.id);
      expect(result.redirectTo).toBe("/tryout/review?session_id=" + session.id + "&notice=session_expired");
      expect(result.message).toBe("Waktu sesi tryout Anda telah berakhir. Sesi telah otomatis diselesaikan.");
    }
  });

  it("returns ERROR status when session ID is not found", async () => {
    const result = await resumeTryoutSession("non-existent-session-id");
    expect(result.status).toBe("ERROR");
    if (result.status === "ERROR") {
      expect(result.error).toContain("tidak ditemukan");
    }
  });

  it("handles pre-existing EXPIRED or COMPLETED session gracefully", async () => {
    const expiredSession = createMockSession({
      id: "sess-already-expired",
      status: "EXPIRED",
    });
    const resultExpired = await resumeTryoutSession(expiredSession.id, new Date(), expiredSession);
    expect(resultExpired.status).toBe("EXPIRED");

    const completedSession = createMockSession({
      id: "sess-already-completed",
      status: "COMPLETED",
    });
    const resultCompleted = await resumeTryoutSession(completedSession.id, new Date(), completedSession);
    expect(resultCompleted.status).toBe("EXPIRED");
  });
});
