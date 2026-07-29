"use client";

import React from "react";
import { ReviewQuestion } from "@/types/tryout";
import { cn } from "@/lib/utils";

interface TryoutNavigationSidebarProps {
  questions: ReviewQuestion[];
  activeQuestionNumber: number;
  filterOnlyWrong: boolean;
  onSelectQuestion: (questionNumber: number) => void;
}

export function TryoutNavigationSidebar({
  questions,
  activeQuestionNumber,
  filterOnlyWrong,
  onSelectQuestion,
}: TryoutNavigationSidebarProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
      <h2 className="text-xs font-bold text-cyan-600 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
        NAVIGASI SOAL
      </h2>

      <div className="grid grid-cols-4 gap-2.5 max-h-[70vh] overflow-y-auto pr-1">
        {questions.map((q) => {
          const isActive = q.number === activeQuestionNumber;
          const isHiddenByFilter = filterOnlyWrong && q.isCorrect;

          return (
            <button
              key={q.id}
              onClick={() => onSelectQuestion(q.number)}
              disabled={isHiddenByFilter}
              aria-label={`${q.number}`}
              className={cn(
                "h-10 w-full rounded-xl border text-sm font-semibold transition-all duration-150 flex items-center justify-center cursor-pointer",
                // Correct vs Incorrect styling
                q.isCorrect
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                  : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100",
                // Active state
                isActive && "ring-2 ring-cyan-500 border-cyan-500 font-bold shadow-xs scale-[1.03]",
                // Filtered state
                isHiddenByFilter && "opacity-25 pointer-events-none cursor-not-allowed"
              )}
            >
              {q.number}
            </button>
          );
        })}
      </div>
    </div>
  );
}
