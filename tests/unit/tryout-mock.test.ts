import { describe, it, expect } from "vitest";
import { mockTryoutReviewData } from "@/data/mock-tryout-review";

describe("Tryout Review Mock Data", () => {
  it("contains valid tryout summary metrics", () => {
    expect(mockTryoutReviewData.title).toBe("Try Out Besar");
    expect(mockTryoutReviewData.questions.length).toBe(50);

    const correctCalculated = mockTryoutReviewData.questions.filter((q) => q.isCorrect).length;
    const wrongCalculated = mockTryoutReviewData.questions.filter((q) => !q.isCorrect).length;

    expect(mockTryoutReviewData.correctCount).toBe(correctCalculated);
    expect(mockTryoutReviewData.wrongCount).toBe(wrongCalculated);
  });

  it("includes the screenshot example questions with explanations", () => {
    const q1 = mockTryoutReviewData.questions.find((q) => q.number === 1);
    expect(q1).toBeDefined();
    expect(q1?.questionText).toContain("osteoartritis");
    expect(q1?.explanation).toBeDefined();
    expect(q1?.options.length).toBe(5);
  });
});
