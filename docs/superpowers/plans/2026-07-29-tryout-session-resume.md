# Tryout Session Resume Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a server-validated tryout session lifecycle management system with resume capability (`resumeTryoutSession`) and graceful auto-submission upon expiration.

**Architecture:** A server-first tryout session manager that calculates remaining duration using wall-clock server timestamps (`started_at + duration_seconds`). When `resumeTryoutSession` is invoked for an idle or paused session whose time has elapsed (`now >= expires_at`), the service gracefully transitions the session status to `COMPLETED` with `autoSubmitted: true` and returns a redirect payload to `/tryout/review?session_id=...&notice=expired` instead of failing with an exception.

**Tech Stack:** Next.js (App Router), TypeScript, Zod, React, Vitest.

## Global Constraints

- Use server-side wall-clock timestamps for session duration calculations (`started_at` + `duration_seconds`).
- Enforce non-negative countdown bounds via `Math.max(0, remainingSeconds)`.
- Never throw unhandled HTTP exceptions on expired session resume; return a structured status result or redirect.
- All new service functions must be covered by Vitest unit tests.

---

### Task 1: Tryout Session Data Models & Validation Schemas

**Files:**
- Modify: `src/types/tryout.ts`
- Create: `src/lib/tryout/validators/session.ts`
- Test: `tests/unit/lib/tryout/session-validator.test.ts`

**Interfaces:**
- Consumes: `ReviewQuestion` from `src/types/tryout.ts`
- Produces: `TryoutSession`, `SessionStatus`, `ResumeSessionResult`, `ResumeSessionInputSchema`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/lib/tryout/session-validator.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { resumeSessionInputSchema } from "@/lib/tryout/validators/session";

describe("Tryout Session Validator", () => {
  it("validates valid session resume payload", () => {
    const input = { sessionId: "sess-123-abc" };
    const parsed = resumeSessionInputSchema.safeParse(input);
    expect(parsed.success).toBe(true);
  });

  it("rejects empty session ID", () => {
    const input = { sessionId: "" };
    const parsed = resumeSessionInputSchema.safeParse(input);
    expect(parsed.success).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/lib/tryout/session-validator.test.ts`
Expected: FAIL with "Cannot find module '@/lib/tryout/validators/session'"

- [ ] **Step 3: Write minimal implementation**

Update `src/types/tryout.ts` with session types:
```typescript
export type SessionStatus = "IN_PROGRESS" | "PAUSED" | "COMPLETED" | "EXPIRED";

export interface TryoutSession {
  id: string;
  userId: string;
  tryoutId: string;
  title: string;
  startedAt: string; // ISO String
  expiresAt: string; // ISO String
  durationSeconds: number;
  status: SessionStatus;
  userAnswers: Record<number, string>; // questionNumber -> optionId
  autoSubmitted?: boolean;
}

export type ResumeSessionResult =
  | {
      status: "ACTIVE";
      session: TryoutSession;
      remainingSeconds: number;
    }
  | {
      status: "EXPIRED";
      sessionId: string;
      redirectTo: string;
      message: string;
    }
  | {
      status: "ERROR";
      error: string;
    };
```

Create `src/lib/tryout/validators/session.ts`:
```typescript
import { z } from "zod";

export const resumeSessionInputSchema = z.object({
  sessionId: z.string().min(1, "ID Sesi tidak boleh kosong"),
});

export type ResumeSessionInput = z.infer<typeof resumeSessionInputSchema>;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/lib/tryout/session-validator.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/types/tryout.ts src/lib/tryout/validators/session.ts tests/unit/lib/tryout/session-validator.test.ts
git commit -m "feat(tryout): add session data models and validation schemas"
```

---

### Task 2: Tryout Session Service & Resume Logic

**Files:**
- Create: `src/lib/tryout/services/session.ts`
- Test: `tests/unit/lib/tryout/session-service.test.ts`

**Interfaces:**
- Consumes: `TryoutSession`, `ResumeSessionResult` from `src/types/tryout.ts`
- Produces: `resumeTryoutSession(sessionId: string, currentTime?: Date): Promise<ResumeSessionResult>`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/lib/tryout/session-service.test.ts`:
```typescript
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
      expect(result.redirectTo).toContain("/tryout/review");
      expect(result.message).toContain("berakhir");
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/lib/tryout/session-service.test.ts`
Expected: FAIL with "Cannot find module '@/lib/tryout/services/session'"

- [ ] **Step 3: Write minimal implementation**

Create `src/lib/tryout/services/session.ts`:
```typescript
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

  // Check if session wall-clock time has expired
  if (session.status === "IN_PROGRESS" && currentTime >= expiresAt) {
    session.status = "EXPIRED";
    session.autoSubmitted = true;
    inMemorySessions.set(session.id, session);

    return {
      status: "EXPIRED",
      sessionId: session.id,
      redirectTo: `/tryout/review?session_id=${session.id}&notice=session_expired`,
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/lib/tryout/session-service.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/tryout/services/session.ts tests/unit/lib/tryout/session-service.test.ts
git commit -m "feat(tryout): implement tryout session service and resume expiration logic"
```

---

### Task 3: Server Action Wrapper & Integration

**Files:**
- Create: `src/app/(protected)/tryout/actions.ts`
- Test: `tests/unit/app/tryout/actions.test.ts`

**Interfaces:**
- Consumes: `resumeTryoutSession` from `src/lib/tryout/services/session.ts`
- Produces: `resumeTryoutSessionAction(sessionId: string)`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/app/tryout/actions.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { resumeTryoutSessionAction } from "@/app/(protected)/tryout/actions";
import { createMockSession } from "@/lib/tryout/services/session";

describe("Tryout Server Actions", () => {
  it("resumes an active session successfully via server action", async () => {
    const session = createMockSession({ id: "action-sess-1" });
    const result = await resumeTryoutSessionAction(session.id);
    expect(result.status).toBe("ACTIVE");
  });

  it("handles empty session ID gracefully", async () => {
    const result = await resumeTryoutSessionAction("");
    expect(result.status).toBe("ERROR");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/app/tryout/actions.test.ts`
Expected: FAIL with "Cannot find module '@/app/(protected)/tryout/actions'"

- [ ] **Step 3: Write minimal implementation**

Create `src/app/(protected)/tryout/actions.ts`:
```typescript
"use server";

import { resumeSessionInputSchema } from "@/lib/tryout/validators/session";
import { resumeTryoutSession } from "@/lib/tryout/services/session";
import { ResumeSessionResult } from "@/types/tryout";

export async function resumeTryoutSessionAction(
  sessionId: string
): Promise<ResumeSessionResult> {
  const validation = resumeSessionInputSchema.safeParse({ sessionId });

  if (!validation.success) {
    return {
      status: "ERROR",
      error: validation.error.errors[0]?.message || "ID Sesi tidak valid.",
    };
  }

  return resumeTryoutSession(validation.data.sessionId);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/app/tryout/actions.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/(protected)/tryout/actions.ts tests/unit/app/tryout/actions.test.ts
git commit -m "feat(tryout): add resumeTryoutSessionAction server action"
```

---

## Verification Plan

### Automated Tests
- Run all unit tests: `npx vitest run tests/unit/lib/tryout/ tests/unit/app/tryout/`
- Run full test suite: `npx vitest run`

### Manual Verification
1. Panggil `resumeTryoutSessionAction("sess-expired")` dengan timestamp lampau.
2. Pastikan status yang dikembalikan adalah `"EXPIRED"`, `redirectTo` mengarah ke `/tryout/review`, dan tidak ada crash runtime.
