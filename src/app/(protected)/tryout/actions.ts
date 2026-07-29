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
      error: validation.error.issues[0]?.message || "ID Sesi tidak valid.",
    };
  }

  return await resumeTryoutSession(validation.data.sessionId);
}
