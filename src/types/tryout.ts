export interface ReviewOption {
  id: string; // 'A' | 'B' | 'C' | 'D' | 'E'
  text: string;
}

export interface ReviewQuestion {
  id: number;
  number: number;
  category: string;
  questionText: string;
  options: ReviewOption[];
  userAnswerId: string;
  correctAnswerId: string;
  isCorrect: boolean;
  explanation: string;
  reference?: string;
}

export interface TryoutReviewSummary {
  title: string;
  totalScore: number;
  correctCount: number;
  wrongCount: number;
  submitDate: string;
  questions: ReviewQuestion[];
}

export type SessionStatus = "IN_PROGRESS" | "PAUSED" | "COMPLETED" | "EXPIRED";

export interface TryoutSession {
  id: string;
  userId: string;
  tryoutId: string;
  title: string;
  startedAt: string;
  expiresAt: string;
  durationSeconds: number;
  status: SessionStatus;
  userAnswers: Record<number, string>;
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

