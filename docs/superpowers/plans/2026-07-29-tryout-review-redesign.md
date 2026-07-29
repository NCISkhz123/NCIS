# Tryout Review Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Overhaul the Tryout Review / Pembahasan page to match the exact 2-column layout of the Try Out exam page, featuring a color-coded question navigation sidebar, green/red option highlights, and an embedded explanation box.

**Architecture:** Define TypeScript interfaces for tryout review data, create a realistic 50-question mock dataset, build modular React components for the summary header, sidebar navigation grid, question view with color-coded options, and embedded explanation box, and compose them in a Next.js page.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Lucide React, Vitest.

## Global Constraints

- Design system: Tailwind CSS v4 + shadcn/ui visual language.
- Color coding: Emerald (`green`) for correct answers/options, Rose (`red`) for user's wrong answers, Cyan (`teal`) for active states and primary buttons matching Screenshot 1.
- Layout: 2-column responsive layout (Sidebar left `col-span-12 lg:col-span-3`, Main area right `col-span-12 lg:col-span-9`).

---

### Task 1: Create Tryout Review Data Models and Mock Dataset

**Files:**
- Create: `src/types/tryout.ts`
- Create: `src/data/mock-tryout-review.ts`
- Test: `tests/unit/tryout-mock.test.ts`

**Interfaces:**
- Produces: `ReviewOption`, `ReviewQuestion`, `TryoutReviewSummary` interfaces and `mockTryoutReviewData` object.

- [ ] **Step 1: Write failing test for tryout mock data**

Create `tests/unit/tryout-mock.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { mockTryoutReviewData } from "@/data/mock-tryout-review";

describe("Tryout Review Mock Data", () => {
  it("contains valid tryout summary metrics", () => {
    expect(mockTryoutReviewData.title).toBe("Try Out Besar");
    expect(mockTryoutReviewData.questions.length).toBe(50);
    
    const correctCalculated = mockTryoutReviewData.questions.filter((q) => q.isCorrect).length;
    const wrongCalculated = mockTryoutReviewData.questions.filter((q) => !q.isCorrect).length;
    
    expect(mockTryoutReviewData.correctCount).toBe(correctCalculated);
    expect(mockTryoutReviewData.wrongCount).toBe(wrongCalculated);
  });

  it("includes the screenshot example questions with explanations", () => {
    const q1 = mockTryoutReviewData.questions.find((q) => q.number === 1);
    expect(q1).toBeDefined();
    expect(q1?.questionText).toContain("osteoartritis");
    expect(q1?.explanation).toBeDefined();
    expect(q1?.options.length).toBe(5);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test:unit tests/unit/tryout-mock.test.ts`
Expected: FAIL due to missing `@/data/mock-tryout-review` and `@/types/tryout`.

- [ ] **Step 3: Implement `src/types/tryout.ts` and `src/data/mock-tryout-review.ts`**

Create `src/types/tryout.ts`:
```typescript
export interface ReviewOption {
  id: string; // 'A' | 'B' | 'C' | 'D' | 'E'
  text: string;
}

export interface ReviewQuestion {
  id: number;
  number: number;
  category: string;
  questionText: string;
  options: ReviewOption[];
  userAnswerId: string;
  correctAnswerId: string;
  isCorrect: boolean;
  explanation: string;
  reference?: string;
}

export interface TryoutReviewSummary {
  title: string;
  totalScore: number;
  correctCount: number;
  wrongCount: number;
  submitDate: string;
  questions: ReviewQuestion[];
}
```

Create `src/data/mock-tryout-review.ts`:
```typescript
import { TryoutReviewSummary } from "@/types/tryout";

export const mockTryoutReviewData: TryoutReviewSummary = {
  title: "Try Out Besar",
  totalScore: 2,
  correctCount: 1,
  wrongCount: 49, // Example mock score matching screenshot 2 metrics
  submitDate: "27 Jul, 10.38",
  questions: Array.from({ length: 50 }, (_, i) => {
    const num = i + 1;
    if (num === 1) {
      return {
        id: 1,
        number: 1,
        category: "Clinical Science",
        questionText:
          "Seorang pria 62 tahun dengan riwayat osteoartritis datang mengeluhkan nyeri lutut yang semakin parah. Pasien juga memiliki riwayat gastritis kronis dan sering kambuh bila minum obat penghilang nyeri tertentu. Dokter ingin memberikan obat yang lebih aman terhadap lambung. Obat analgesik apa yang lebih sesuai diberikan pada pasien osteoartritis dengan riwayat gastritis ini?",
        options: [
          { id: "A", text: "Ibuprofen" },
          { id: "B", text: "Naproxen" },
          { id: "C", text: "Asam mefenamat" },
          { id: "D", text: "Celecoxib" },
          { id: "E", text: "Ketoprofen" },
        ],
        userAnswerId: "A",
        correctAnswerId: "D",
        isCorrect: false,
        explanation:
          "Celecoxib adalah obat antiinflamasi nonsteroid (OAINS) selektif penghambat COX-2. Penghambatan selektif COX-2 memberikan efek analgesik dan antiinflamasi tanpa mengganggu fungsi protektif lambung yang dimediasi oleh COX-1, sehingga lebih aman bagi pasien dengan riwayat gastritis atau ulkus peptikum dibanding OAINS non-selektif seperti Ibuprofen, Naproxen, Asam mefenamat, atau Ketoprofen.",
        reference: "Pedoman Penatalaksanaan Nyeri & Osteoartritis 2021",
      };
    }

    if (num === 2) {
      return {
        id: 2,
        number: 2,
        category: "Clinical Science",
        questionText:
          "Seorang pria datang ke dokter untuk memeriksakan keadaannya. Pasien merupakan seorang ODHA, dan saat ini merasakan sariawan di mulutnya. Dokter mendiagnosis pasien dengan candidiasis oral, akan tetapi nistatin sebagai pilihan pertama terapi sedang kosong. Obat apakah yang dapat digunakan sebagai pengganti Nistatin?",
        options: [
          { id: "A", text: "Ketokonazole" },
          { id: "B", text: "Flukonazole" },
          { id: "C", text: "Griseofulvin" },
          { id: "D", text: "Amfoterisin B" },
          { id: "E", text: "Terbinafin" },
        ],
        userAnswerId: "B",
        correctAnswerId: "B",
        isCorrect: true,
        explanation:
          "Pada pasien dengan infeksi HIV dan mengalami candidiasis oral dapat diberikan Flukonazole sebagai alternatif Nistatin oral suspension apabila Nistatin tidak tersedia.",
        reference: "PNPK Tata Laksana HIV 2019",
      };
    }

    // Default mock for questions 3..50
    const isCorr = num % 2 === 0;
    return {
      id: num,
      number: num,
      category: num % 3 === 0 ? "Pharmaceutical Science" : "Clinical Science",
      questionText: `Soal latihan nomor ${num}: Seorang pasien dirawat dengan diagnosa spesifik. Formulasi obat manakah yang paling sesuai untuk kondisi klinis pasien ini berdasarkan panduan praktik klinis?`,
      options: [
        { id: "A", text: `Pilihan formulasi obat A untuk soal ${num}` },
        { id: "B", text: `Pilihan formulasi obat B untuk soal ${num}` },
        { id: "C", text: `Pilihan formulasi obat C untuk soal ${num}` },
        { id: "D", text: `Pilihan formulasi obat D untuk soal ${num}` },
        { id: "E", text: `Pilihan formulasi obat E untuk soal ${num}` },
      ],
      userAnswerId: isCorr ? "A" : "C",
      correctAnswerId: "A",
      isCorrect: isCorr,
      explanation: `Pembahasan rinci untuk soal nomor ${num}: Opsi A adalah jawaban yang paling tepat berdasarkan mekanisme kerja dan profil keamanan obat.`,
      reference: "Kompendium Farmakoterapi 2024",
    };
  }),
};

// Update exact counts based on array
mockTryoutReviewData.correctCount = mockTryoutReviewData.questions.filter((q) => q.isCorrect).length;
mockTryoutReviewData.wrongCount = mockTryoutReviewData.questions.filter((q) => !q.isCorrect).length;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test:unit tests/unit/tryout-mock.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/types/tryout.ts src/data/mock-tryout-review.ts tests/unit/tryout-mock.test.ts
git commit -m "feat: add tryout review data models and mock dataset"
```

---

### Task 2: Build Tryout Review Header Summary Component

**Files:**
- Create: `src/components/tryout/tryout-review-header.tsx`
- Test: `tests/unit/tryout-review-header.test.tsx`

**Interfaces:**
- Consumes: `TryoutReviewSummary`
- Produces: `TryoutReviewHeader` component rendering title, stats (Skor, Benar, Salah, Tanggal), and `filterOnlyWrong` toggle.

- [ ] **Step 1: Write failing test for header component**

Create `tests/unit/tryout-review-header.test.tsx`:
```typescript
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test:unit tests/unit/tryout-review-header.test.tsx`
Expected: FAIL due to missing `TryoutReviewHeader`.

- [ ] **Step 3: Implement `src/components/tryout/tryout-review-header.tsx`**

Create `src/components/tryout/tryout-review-header.tsx`:
```tsx
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test:unit tests/unit/tryout-review-header.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/tryout/tryout-review-header.tsx tests/unit/tryout-review-header.test.tsx
git commit -m "feat: add TryoutReviewHeader component with statistics and filter"
```

---

### Task 3: Build Navigation Sidebar Component (`NAVIGASI SOAL`)

**Files:**
- Create: `src/components/tryout/tryout-navigation-sidebar.tsx`
- Test: `tests/unit/tryout-navigation-sidebar.test.tsx`

**Interfaces:**
- Consumes: `questions: ReviewQuestion[]`, `activeQuestionNumber: number`, `filterOnlyWrong: boolean`, `onSelectQuestion: (num: number) => void`
- Produces: Sidebar card matching Screenshot 1 layout with color-coded number buttons.

- [ ] **Step 1: Write failing test for sidebar component**

Create `tests/unit/tryout-navigation-sidebar.test.tsx`:
```typescript
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test:unit tests/unit/tryout-navigation-sidebar.test.tsx`
Expected: FAIL due to missing `TryoutNavigationSidebar`.

- [ ] **Step 3: Implement `src/components/tryout/tryout-navigation-sidebar.tsx`**

Create `src/components/tryout/tryout-navigation-sidebar.tsx`:
```tsx
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test:unit tests/unit/tryout-navigation-sidebar.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/tryout/tryout-navigation-sidebar.tsx tests/unit/tryout-navigation-sidebar.test.tsx
git commit -m "feat: add TryoutNavigationSidebar with 4-col grid and green/red status"
```

---

### Task 4: Build Question View with Color-Coded Options and Pembahasan Box

**Files:**
- Create: `src/components/tryout/tryout-pembahasan-box.tsx`
- Create: `src/components/tryout/tryout-question-view.tsx`
- Test: `tests/unit/tryout-question-view.test.tsx`

**Interfaces:**
- Consumes: `question: ReviewQuestion`, `totalQuestions: number`, `onPrevious: () => void`, `onNext: () => void`
- Produces: Question display matching Screenshot 1 layout, option evaluation badges (Emerald/Rose), embedded Pembahasan box in yellow-circled area, and previous/next buttons.

- [ ] **Step 1: Write failing test for question view component**

Create `tests/unit/tryout-question-view.test.tsx`:
```typescript
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test:unit tests/unit/tryout-question-view.test.tsx`
Expected: FAIL due to missing `TryoutQuestionView`.

- [ ] **Step 3: Implement `src/components/tryout/tryout-pembahasan-box.tsx` and `src/components/tryout/tryout-question-view.tsx`**

Create `src/components/tryout/tryout-pembahasan-box.tsx`:
```tsx
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
```

Create `src/components/tryout/tryout-question-view.tsx`:
```tsx
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test:unit tests/unit/tryout-question-view.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/tryout/tryout-pembahasan-box.tsx src/components/tryout/tryout-question-view.tsx tests/unit/tryout-question-view.test.tsx
git commit -m "feat: add TryoutQuestionView with color-coded options and embedded Pembahasan box"
```

---

### Task 5: Assemble Main Review Container & Create App Route

**Files:**
- Create: `src/components/tryout/tryout-review-view.tsx`
- Create: `src/app/(protected)/tryout/review/page.tsx`
- Test: `tests/unit/tryout-review-view.test.tsx`

**Interfaces:**
- Consumes: `TryoutReviewSummary` mock dataset.
- Produces: Integrated Page at `/tryout/review` connecting state (`activeQuestionNumber`, `filterOnlyWrong`), header, sidebar grid, and question view.

- [ ] **Step 1: Write failing test for full review view component**

Create `tests/unit/tryout-review-view.test.tsx`:
```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TryoutReviewView } from "@/components/tryout/tryout-review-view";
import { mockTryoutReviewData } from "@/data/mock-tryout-review";

describe("TryoutReviewView Component", () => {
  it("renders full tryout review layout with header, sidebar, and question view", () => {
    render(<TryoutReviewView initialData={mockTryoutReviewData} />);

    expect(screen.getByText("Try Out Besar")).toBeInTheDocument();
    expect(screen.getByText("NAVIGASI SOAL")).toBeInTheDocument();
    expect(screen.getByText("Soal 1 dari 50")).toBeInTheDocument();
  });

  it("updates question when sidebar number is clicked", () => {
    render(<TryoutReviewView initialData={mockTryoutReviewData} />);

    fireEvent.click(screen.getByRole("button", { name: "2" }));
    expect(screen.getByText("Soal 2 dari 50")).toBeInTheDocument();
    expect(screen.getByText(/Nistatin/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test:unit tests/unit/tryout-review-view.test.tsx`
Expected: FAIL due to missing `TryoutReviewView`.

- [ ] **Step 3: Implement `src/components/tryout/tryout-review-view.tsx` and `src/app/(protected)/tryout/review/page.tsx`**

Create `src/components/tryout/tryout-review-view.tsx`:
```tsx
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
```

Create `src/app/(protected)/tryout/review/page.tsx`:
```tsx
import React from "react";
import { TryoutReviewView } from "@/components/tryout/tryout-review-view";
import { mockTryoutReviewData } from "@/data/mock-tryout-review";

export const metadata = {
  title: "Review Pembahasan Try Out | NCIS",
};

export default function TryoutReviewPage() {
  return <TryoutReviewView initialData={mockTryoutReviewData} />;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test:unit tests/unit/tryout-review-view.test.tsx`
Expected: PASS

- [ ] **Step 5: Run full test suite and type check**

Run: `pnpm check`
Expected: Zero lint errors, zero type errors, all unit tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/tryout/tryout-review-view.tsx src/app/\(protected\)/tryout/review/page.tsx tests/unit/tryout-review-view.test.tsx
git commit -m "feat: complete tryout review page overhaul with sidebar navigation and color-coded pembahasan"
```

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-29-tryout-review-redesign.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration
**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
