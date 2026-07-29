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

  const visibleQuestions = React.useMemo(() => {
    return filterOnlyWrong
      ? initialData.questions.filter((q) => !q.isCorrect)
      : initialData.questions;
  }, [initialData.questions, filterOnlyWrong]);

  const activeQuestion = React.useMemo(() => {
    return (
      visibleQuestions.find((q) => q.number === activeQuestionNumber) ||
      visibleQuestions[0] ||
      initialData.questions[0]
    );
  }, [visibleQuestions, activeQuestionNumber, initialData.questions]);

  const handleToggleFilter = (value: boolean) => {
    setFilterOnlyWrong(value);
    if (value) {
      const wrongQuestions = initialData.questions.filter((q) => !q.isCorrect);
      if (wrongQuestions.length > 0) {
        const isCurrentWrong = wrongQuestions.some(
          (q) => q.number === activeQuestionNumber
        );
        if (!isCurrentWrong) {
          setActiveQuestionNumber(wrongQuestions[0].number);
        }
      }
    }
  };

  const currentIndexInVisible = visibleQuestions.findIndex(
    (q) => q.number === activeQuestion.number
  );

  const handlePrevious = () => {
    if (currentIndexInVisible > 0) {
      setActiveQuestionNumber(visibleQuestions[currentIndexInVisible - 1].number);
    }
  };

  const handleNext = () => {
    if (currentIndexInVisible >= 0 && currentIndexInVisible < visibleQuestions.length - 1) {
      setActiveQuestionNumber(visibleQuestions[currentIndexInVisible + 1].number);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Top Header Summary */}
      <TryoutReviewHeader
        summary={initialData}
        filterOnlyWrong={filterOnlyWrong}
        onToggleFilter={handleToggleFilter}
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
