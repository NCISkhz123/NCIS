"use client";

import React from "react";
import { TryoutReviewSummary } from "@/types/tryout";
import { CheckCircle2, XCircle, Award, Calendar } from "lucide-react";

interface TryoutReviewHeaderProps {
  summary: TryoutReviewSummary;
  filterOnlyWrong: boolean;
  onToggleFilter: (onlyWrong: boolean) => void;
}

export function TryoutReviewHeader({
  summary,
  filterOnlyWrong,
  onToggleFilter,
}: TryoutReviewHeaderProps) {
  return (
    <div className="space-y-4 mb-6">
      {/* Top Banner Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 mb-1">
              Try out
            </span>
            <h1 className="text-2xl font-bold text-slate-900">{summary.title}</h1>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Skor */}
          <div className="rounded-xl border border-cyan-100 bg-cyan-50/40 p-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-cyan-700">
              <Award className="h-4 w-4" />
              SKOR
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              {summary.totalScore}
            </div>
          </div>

          {/* Jawaban Benar */}
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              JAWABAN BENAR
            </div>
            <div className="mt-2 text-2xl font-bold text-emerald-700">
              {summary.correctCount}
            </div>
          </div>

          {/* Jawaban Salah */}
          <div className="rounded-xl border border-rose-100 bg-rose-50/40 p-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-rose-700">
              <XCircle className="h-4 w-4" />
              JAWABAN SALAH
            </div>
            <div className="mt-2 text-2xl font-bold text-rose-700">
              {summary.wrongCount}
            </div>
          </div>

          {/* Tanggal Submit */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <Calendar className="h-4 w-4" />
              TANGGAL SUBMIT
            </div>
            <div className="mt-2 text-base font-semibold text-slate-800">
              {summary.submitDate}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center gap-2 px-1">
        <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filterOnlyWrong}
            onChange={(e) => onToggleFilter(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
          />
          Hanya jawaban salah
        </label>
      </div>
    </div>
  );
}
