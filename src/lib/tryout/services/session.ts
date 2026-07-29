import { TryoutSession, ResumeSessionResult } from "@/types/tryout";

const inMemorySessions = new Map<string, TryoutSession>();

export function createMockSession(overrides: Partial<TryoutSession> = {}): TryoutSession {
  const defaultSession: TryoutSession = {
    id: overrides.id || "sess-default",
    userId: "usr-demo",
    tryoutId: "tryout-1",
    title: "Try Out UKMPPAI",
    startedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 90).toISOString(),
    durationSeconds: 7200,
    status: "IN_PROGRESS",
    userAnswers: { 1: "A", 2: "B" },
    ...overrides,
  };
  inMemorySessions.set(defaultSession.id, defaultSession);
  return defaultSession;
}

export async function resumeTryoutSession(
  sessionId: string,
  currentTime: Date = new Date(),
  overrideSession?: TryoutSession
): Promise<ResumeSessionResult> {
  const session = overrideSession || inMemorySessions.get(sessionId);

  if (!session) {
    return {
      status: "ERROR",
      error: `Sesi tryout ${sessionId} tidak ditemukan.`,
    };
  }

  const expiresAt = new Date(session.expiresAt);

  if (session.status === "EXPIRED") {
    return {
      status: "EXPIRED",
      sessionId: session.id,
      redirectTo: "/tryout/review?session_id=" + session.id + "&notice=session_expired",
      message: "Sesi tryout ini telah berakhir.",
    };
  }

  if (session.status === "COMPLETED") {
    return {
      status: "EXPIRED",
      sessionId: session.id,
      redirectTo: "/tryout/review?session_id=" + session.id,
      message: "Sesi tryout ini telah selesai.",
    };
  }

  // Check if session wall-clock time has expired
  if (session.status === "IN_PROGRESS" && currentTime >= expiresAt) {
    session.status = "EXPIRED";
    session.autoSubmitted = true;
    inMemorySessions.set(session.id, session);

    return {
      status: "EXPIRED",
      sessionId: session.id,
      redirectTo: "/tryout/review?session_id=" + session.id + "&notice=session_expired",
      message: "Waktu sesi tryout Anda telah berakhir. Sesi telah otomatis diselesaikan.",
    };
  }

  const remainingSeconds = Math.max(
    0,
    Math.floor((expiresAt.getTime() - currentTime.getTime()) / 1000)
  );

  return {
    status: "ACTIVE",
    session,
    remainingSeconds,
  };
}
