// @vitest-environment jsdom
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { TryoutReviewHeader } from "@/components/tryout/tryout-review-header";
import { mockTryoutReviewData } from "@/data/mock-tryout-review";

describe("TryoutReviewHeader Component", () => {
  it("renders summary statistics correctly", () => {
    render(
      <TryoutReviewHeader
        summary={mockTryoutReviewData}
        filterOnlyWrong={false}
        onToggleFilter={vi.fn()}
      />
    );

    expect(screen.getByText("Try Out Besar")).toBeInTheDocument();
    expect(screen.getByText("SKOR")).toBeInTheDocument();
    expect(screen.getByText("JAWABAN BENAR")).toBeInTheDocument();
    expect(screen.getByText("JAWABAN SALAH")).toBeInTheDocument();
    expect(screen.getByText("Hanya jawaban salah")).toBeInTheDocument();
  });

  it("triggers onToggleFilter when checkbox is toggled", () => {
    const handleToggle = vi.fn();
    render(
      <TryoutReviewHeader
        summary={mockTryoutReviewData}
        filterOnlyWrong={false}
        onToggleFilter={handleToggle}
      />
    );

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);
    expect(handleToggle).toHaveBeenCalledWith(true);
  });
});
