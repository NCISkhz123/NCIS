import { z } from "zod";

export const resumeSessionInputSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
});

export type ResumeSessionInput = z.infer<typeof resumeSessionInputSchema>;
