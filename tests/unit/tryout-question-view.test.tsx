// @vitest-environment jsdom
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { TryoutQuestionView } from "@/components/tryout/tryout-question-view";
import { mockTryoutReviewData } from "@/data/mock-tryout-review";

describe("TryoutQuestionView Component", () => {
  it("renders question category, number, options, and explanation", () => {
    const q1 = mockTryoutReviewData.questions[0];
    render(
      <TryoutQuestionView
        question={q1}
        totalQuestions={50}
        onPrevious={vi.fn()}
        onNext={vi.fn()}
      />
    );

    expect(screen.getByText("Clinical Science")).toBeInTheDocument();
    expect(screen.getByText(/Soal 1/)).toBeInTheDocument();
    expect(screen.getByText(/osteoartritis/)).toBeInTheDocument();
    expect(screen.getByText("Celecoxib")).toBeInTheDocument();
    expect(screen.getByText("PENJELASAN")).toBeInTheDocument();
    expect(screen.getByText(/COX-2/)).toBeInTheDocument();
  });

  it("triggers navigation handlers on button clicks", () => {
    const handlePrev = vi.fn();
    const handleNext = vi.fn();

    render(
      <TryoutQuestionView
        question={mockTryoutReviewData.questions[1]}
        totalQuestions={50}
        onPrevious={handlePrev}
        onNext={handleNext}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Sebelumnya/i }));
    expect(handlePrev).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /Selanjutnya/i }));
    expect(handleNext).toHaveBeenCalled();
  });
});
