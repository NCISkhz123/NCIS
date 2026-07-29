"use client";

import React, { useState } from "react";
import { TryoutReviewSummary } from "@/types/tryout";
import { TryoutReviewHeader } from "./tryout-review-header";
import { TryoutNavigationSidebar } from "./tryout-navigation-sidebar";
import { TryoutQuestionView } from "./tryout-question-view";

interface TryoutReviewViewProps {
  initialData: TryoutReviewSummary;
}

export function TryoutReviewView({ initialData }: TryoutReviewViewProps) {
  const [activeQuestionNumber, setActiveQuestionNumber] = useState(1);
  const [filterOnlyWrong, setFilterOnlyWrong] = useState(false);

  const activeQuestion =
    initialData.questions.find((q) => q.number === activeQuestionNumber) ||
    initialData.questions[0];

  const handlePrevious = () => {
    if (activeQuestionNumber > 1) {
      setActiveQuestionNumber((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (activeQuestionNumber < initialData.questions.length) {
      setActiveQuestionNumber((prev) => prev + 1);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Top Header Summary */}
      <TryoutReviewHeader
        summary={initialData}
        filterOnlyWrong={filterOnlyWrong}
        onToggleFilter={setFilterOnlyWrong}
      />

      {/* 2-Column Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar - Navigasi Soal */}
        <div className="lg:col-span-4 xl:col-span-3">
          <TryoutNavigationSidebar
            questions={initialData.questions}
            activeQuestionNumber={activeQuestionNumber}
            filterOnlyWrong={filterOnlyWrong}
            onSelectQuestion={setActiveQuestionNumber}
          />
        </div>

        {/* Right Main Area - Question & Pembahasan */}
        <div className="lg:col-span-8 xl:col-span-9">
          <TryoutQuestionView
            question={activeQuestion}
            totalQuestions={initialData.questions.length}
            onPrevious={handlePrevious}
            onNext={handleNext}
          />
        </div>
      </div>
    </div>
  );
}
