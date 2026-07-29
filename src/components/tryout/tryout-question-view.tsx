"use client";

import React from "react";
import { ReviewQuestion } from "@/types/tryout";
import { TryoutPembahasanBox } from "./tryout-pembahasan-box";
import { Check, X, ArrowLeft, ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TryoutQuestionViewProps {
  question: ReviewQuestion;
  totalQuestions: number;
  onPrevious: () => void;
  onNext: () => void;
}

export function TryoutQuestionView({
  question,
  totalQuestions,
  onPrevious,
  onNext,
}: TryoutQuestionViewProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs">
      {/* Category Pill & Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="inline-block rounded-full border border-cyan-300 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
          {question.category}
        </span>

        {/* Status Badge */}
        {question.isCorrect ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            Sudah benar
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-800">
            <XCircle className="h-3.5 w-3.5 text-rose-600" />
            Jawaban salah
          </span>
        )}
      </div>

      {/* Question Counter */}
      <h2 className="text-xl font-bold text-slate-900 mb-4">
        Soal {question.number}{" "}
        <span className="text-slate-400 font-normal text-base">dari {totalQuestions}</span>
      </h2>

      {/* Question Text */}
      <p className="text-slate-800 text-base leading-relaxed mb-6 font-normal">
        {question.questionText}
      </p>

      {/* Options List */}
      <div className="space-y-3 mb-6">
        {question.options.map((opt) => {
          const isCorrectAnswer = opt.id === question.correctAnswerId;
          const isUserAnswer = opt.id === question.userAnswerId;
          const isUserWrong = isUserAnswer && !isCorrectAnswer;

          return (
            <div
              key={opt.id}
              className={cn(
                "relative flex items-center justify-between rounded-xl border p-4 transition-all text-sm font-medium",
                // Correct option (Green)
                isCorrectAnswer &&
                  "border-emerald-400 bg-emerald-50/80 text-emerald-950 font-semibold shadow-xs",
                // User wrong option (Red)
                isUserWrong &&
                  "border-rose-400 bg-rose-50/80 text-rose-950 font-semibold shadow-xs",
                // Neutral options
                !isCorrectAnswer &&
                  !isUserWrong &&
                  "border-slate-200 bg-white text-slate-700"
              )}
            >
              <div className="flex items-start gap-3 pr-4">
                {/* Option Letter Circle */}
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold border",
                    isCorrectAnswer && "bg-emerald-600 text-white border-emerald-600",
                    isUserWrong && "bg-rose-600 text-white border-rose-600",
                    !isCorrectAnswer && !isUserWrong && "border-slate-300 bg-slate-100 text-slate-600"
                  )}
                >
                  {opt.id}
                </span>

                <span className="pt-0.5">{opt.text}</span>
              </div>

              {/* Option Status Badge */}
              {isCorrectAnswer && (
                <span className="shrink-0 inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full border border-emerald-300">
                  <Check className="h-3.5 w-3.5" />
                  Jawaban Benar
                </span>
              )}

              {isUserWrong && (
                <span className="shrink-0 inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-100/80 px-2.5 py-1 rounded-full border border-rose-300">
                  <X className="h-3.5 w-3.5" />
                  Jawabanmu (Salah)
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Embedded Pembahasan Box (Circle Yellow Area Screenshot 1) */}
      <TryoutPembahasanBox
        explanation={question.explanation}
        reference={question.reference}
      />

      {/* Bottom Navigation Buttons */}
      <div className="mt-8 pt-4 flex items-center justify-between border-t border-slate-100">
        <button
          onClick={onPrevious}
          disabled={question.number === 1}
          aria-label="Sebelumnya"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Sebelumnya
        </button>

        <button
          onClick={onNext}
          disabled={question.number === totalQuestions}
          aria-label="Selanjutnya"
          className="inline-flex items-center gap-2 rounded-full bg-cyan-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-600 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs cursor-pointer"
        >
          Selanjutnya
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
