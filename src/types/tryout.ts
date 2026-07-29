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
