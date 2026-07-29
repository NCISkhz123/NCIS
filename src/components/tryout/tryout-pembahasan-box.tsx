"use client";

import React from "react";
import { BookOpen, Bookmark } from "lucide-react";

interface TryoutPembahasanBoxProps {
  explanation: string;
  reference?: string;
}

export function TryoutPembahasanBox({
  explanation,
  reference,
}: TryoutPembahasanBoxProps) {
  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/80 p-5 shadow-2xs">
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-100 px-3 py-1 text-xs font-bold text-cyan-800 uppercase tracking-wider">
          <BookOpen className="h-3.5 w-3.5" />
          PENJELASAN
        </span>
      </div>

      <div className="text-sm text-slate-800 leading-relaxed space-y-3">
        <p>{explanation}</p>

        {reference && (
          <div className="flex items-center gap-1.5 pt-2 text-xs font-medium text-slate-500 border-t border-slate-200/60">
            <Bookmark className="h-3.5 w-3.5 text-cyan-600" />
            <span>Referensi: {reference}</span>
          </div>
        )}
      </div>
    </div>
  );
}
