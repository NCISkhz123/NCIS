// @vitest-environment jsdom
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TryoutReviewView } from "@/components/tryout/tryout-review-view";
import { mockTryoutReviewData } from "@/data/mock-tryout-review";

describe("TryoutReviewView Component", () => {
  it("renders full tryout review layout with header, sidebar, and question view", () => {
    render(<TryoutReviewView initialData={mockTryoutReviewData} />);

    expect(screen.getByText("Try Out Besar")).toBeInTheDocument();
    expect(screen.getByText("NAVIGASI SOAL")).toBeInTheDocument();
    expect(screen.getByText(/Soal 1/)).toBeInTheDocument();
    expect(screen.getByText(/dari 50/)).toBeInTheDocument();
  });

  it("updates question when sidebar number is clicked", () => {
    render(<TryoutReviewView initialData={mockTryoutReviewData} />);

    fireEvent.click(screen.getByRole("button", { name: "2" }));
    expect(screen.getByText(/Soal 2/)).toBeInTheDocument();
    expect(screen.getAllByText(/Nistatin/)[0]).toBeInTheDocument();
  });

  it("syncs active question and skips correct questions when filter only wrong is enabled", () => {
    render(<TryoutReviewView initialData={mockTryoutReviewData} />);

    // Select question 2 (which is correct)
    fireEvent.click(screen.getByRole("button", { name: "2" }));
    expect(screen.getByText(/Soal 2/)).toBeInTheDocument();

    // Enable filter "Hanya jawaban salah"
    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    // Active question should auto-sync to a wrong question (e.g. question 1)
    expect(screen.getByText(/Soal 1/)).toBeInTheDocument();
  });
});
