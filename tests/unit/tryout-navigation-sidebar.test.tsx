// @vitest-environment jsdom
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { TryoutNavigationSidebar } from "@/components/tryout/tryout-navigation-sidebar";
import { mockTryoutReviewData } from "@/data/mock-tryout-review";

describe("TryoutNavigationSidebar Component", () => {
  it("renders 50 question buttons with NAVIGASI SOAL title", () => {
    render(
      <TryoutNavigationSidebar
        questions={mockTryoutReviewData.questions}
        activeQuestionNumber={1}
        filterOnlyWrong={false}
        onSelectQuestion={vi.fn()}
      />
    );

    expect(screen.getByText("NAVIGASI SOAL")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "50" })).toBeInTheDocument();
  });

  it("calls onSelectQuestion when a number button is clicked", () => {
    const handleSelect = vi.fn();
    render(
      <TryoutNavigationSidebar
        questions={mockTryoutReviewData.questions}
        activeQuestionNumber={1}
        filterOnlyWrong={false}
        onSelectQuestion={handleSelect}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "2" }));
    expect(handleSelect).toHaveBeenCalledWith(2);
  });
});
