# Login Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the NCIS (Non Clinical Integrated System) login page with a split 60/40 screen layout, aerial RSUD background image, glassmorphism overlay badge, and refined Shadcn/UI form card on the right.

**Architecture:** Split flex/grid layout (`lg:flex-row`). The left section features `/bg-login.jpg` with dark slate-950 radial vignette gradient and a centered glassmorphism overlay card containing hospital & system titles. The right section features an elevated dark slate-900 Shadcn/UI login form with tactile micro-physics and demo user tags.

**Tech Stack:** Next.js 15 App Router, React 19, Tailwind CSS v4, Lucide React icons, TypeScript.

## Global Constraints
- Target Files: `src/app/(auth)/login/page.tsx`, `src/components/auth/login-form.tsx`
- Background Asset: `public/bg-login.jpg`
- Headline Text: `NON CLINICAL INTEGRATED SYSTEM`
- Subtitle Text: `(RSUD KHZ. MUSTHAFA TASIKMALAYA)`
- Color Tone: Slate-950 dark background, Slate-900 card surface, Sky-500 accents

---

### Task 1: Redesign Login Page Component (`src/app/(auth)/login/page.tsx`)

**Files:**
- Modify: `src/app/(auth)/login/page.tsx`
- Asset: `public/bg-login.jpg`

**Interfaces:**
- Consumes: `loginAction` from `./actions`, `LoginForm` from `@/components/auth/login-form`
- Produces: Redesigned full-page layout for `/login` route

- [ ] **Step 1: Replace layout structure in `src/app/(auth)/login/page.tsx` with split 60/40 design**

```tsx
import { redirect } from "next/navigation";
import Image from "next/image";
import { Activity, ShieldCheck, Hospital } from "lucide-react";

import { LoginForm } from "@/components/auth/login-form";
import { getDefaultModulePath } from "@/lib/auth/guards";
import { getCurrentProfile } from "@/lib/auth/profile";

import { loginAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const profile = await getCurrentProfile();
  const defaultModulePath = profile ? getDefaultModulePath(profile.role) : null;

  if (defaultModulePath) {
    redirect(defaultModulePath);
  }

  return (
    <main className="relative flex min-h-[100dvh] w-full flex-col lg:flex-row bg-slate-950 text-slate-100 overflow-x-hidden antialiased">
      {/* LEFT HERO SECTION (60% Desktop Width / Top Banner Mobile) */}
      <div className="relative flex min-h-[380px] lg:min-h-[100dvh] w-full lg:w-[58%] xl:w-[62%] flex-col items-center justify-center p-6 sm:p-10 overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800/60">
        {/* Background Aerial Photography */}
        <Image
          src="/bg-login.jpg"
          alt="RSUD KHZ. Musthafa Tasikmalaya Aerial View"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 62vw"
          className="object-cover object-center filter brightness-[0.65] contrast-[1.1] scale-[1.02] transition-transform duration-1000"
        />

        {/* Ambient Dark Overlay Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/40" />
        <div className="absolute inset-0 bg-radial from-transparent via-slate-950/40 to-slate-950" />

        {/* Decorative Glow Orbs */}
        <div className="pointer-events-none absolute top-1/4 left-1/4 h-80 w-80 rounded-full bg-sky-500/20 blur-[100px]" />
        <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-teal-500/15 blur-[100px]" />

        {/* CENTERED GLASSMORPHISM OVERLAY CARD */}
        <div className="relative z-10 w-full max-w-xl text-center">
          <div className="group relative rounded-3xl border border-slate-700/50 bg-slate-950/60 p-8 sm:p-10 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-sky-500/40">
            {/* Top Chip / Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1.5 text-xs font-extrabold tracking-widest text-sky-400 uppercase shadow-inner mb-6">
              <Activity className="h-4 w-4 animate-pulse text-sky-400" />
              NCIS HEALTHCARE PLATFORM
            </div>

            {/* Main Headline */}
            <h1 className="text-2xl sm:text-4xl xl:text-5xl font-black tracking-tight text-white leading-tight uppercase font-sans">
              NON CLINICAL INTEGRATED SYSTEM
            </h1>

            {/* Hospital Subtitle */}
            <div className="mt-3 flex items-center justify-center gap-2 text-sm sm:text-base font-bold tracking-wider text-sky-300 uppercase">
              <Hospital className="h-4 w-4 text-sky-400 shrink-0" />
              <span>(RSUD KHZ. MUSTHAFA TASIKMALAYA)</span>
            </div>

            {/* Divider Line */}
            <div className="my-6 mx-auto h-px w-24 bg-gradient-to-r from-transparent via-sky-500/50 to-transparent" />

            {/* Description Subtext */}
            <p className="text-xs sm:text-sm font-medium text-slate-300 leading-relaxed max-w-md mx-auto">
              Portal Operasional Terpadu untuk Manajemen Sterilisasi Sentral (CSSD), Laundry & Distribusi Logistik Non-Klinis.
            </p>

            {/* Bottom Security Pill */}
            <div className="mt-6 inline-flex items-center gap-2 text-[11px] font-mono text-slate-400 bg-slate-900/50 px-3 py-1 rounded-full border border-slate-800">
              <ShieldCheck className="h-3.5 w-3.5 text-teal-400" />
              <span>Enkripsi Sesi End-to-End RSUD</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT LOGIN FORM SECTION (40% Desktop Width) */}
      <div className="relative flex w-full lg:w-[42%] xl:w-[38%] flex-col items-center justify-center p-6 sm:p-12 bg-slate-950">
        <div className="w-full max-w-md space-y-6">
          {/* Form Card */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 sm:p-10 shadow-2xl backdrop-blur-md">
            <div className="mb-6 space-y-1">
              <h2 className="text-2xl font-black tracking-tight text-white">Selamat Datang Kembali</h2>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">
                Masukan kredensial terdaftar Anda untuk mengakses portal.
              </p>
            </div>

            <LoginForm action={loginAction} />
          </div>

          {/* Demo Credentials Info Box */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 text-center backdrop-blur-sm">
            <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Kredensial Demo Akun Lokal:
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-2 text-xs font-mono text-slate-300">
              <span className="rounded-lg border border-slate-700/60 bg-slate-800/80 px-2.5 py-1">
                admin.cssd@ncis.local
              </span>
              <span className="rounded-lg border border-slate-700/60 bg-slate-800/80 px-2.5 py-1">
                petugas.cssd@ncis.local
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verify build & syntax**

Run: `npx tsc --noEmit`
Expected: No type errors.

- [ ] **Step 3: Commit changes**

```bash
git add src/app/\(auth\)/login/page.tsx
git commit -m "style: redesign login page with split layout and glassmorphism overlay"
```

---

### Task 2: Polish Login Form Component (`src/components/auth/login-form.tsx`)

**Files:**
- Modify: `src/components/auth/login-form.tsx`

**Interfaces:**
- Consumes: `LoginActionState` from `@/app/(auth)/login/actions`, `Button` from `@/components/ui/button`
- Produces: Enhanced interactive form component with focus rings and tactile feedback

- [ ] **Step 1: Update `src/components/auth/login-form.tsx` styling for crisp contrast and tactile button**

```tsx
"use client";

import { useActionState } from "react";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

import type { LoginActionState } from "@/app/(auth)/login/actions";
import { Button } from "@/components/ui/button";

type LoginFormProps = {
  action: (
    state: LoginActionState | null,
    formData: FormData
  ) => Promise<LoginActionState>;
};

export function LoginForm({ action }: LoginFormProps) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <label
          htmlFor="email-input"
          className="text-xs font-bold uppercase tracking-wider text-slate-300"
        >
          Email User
        </label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="email-input"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="flex h-11 w-full rounded-xl border border-slate-700/80 bg-slate-950/80 pl-10 pr-4 text-sm text-white font-medium placeholder-slate-500 shadow-xs transition-all focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
            placeholder="nama@ncis.local"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="password-input"
          className="text-xs font-bold uppercase tracking-wider text-slate-300"
        >
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="password-input"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="flex h-11 w-full rounded-xl border border-slate-700/80 bg-slate-950/80 pl-10 pr-4 text-sm text-white font-medium placeholder-slate-500 shadow-xs transition-all focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
            placeholder="••••••••"
          />
        </div>
      </div>

      {state?.ok === false ? (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/20 p-3 text-xs font-bold text-rose-200 animate-in fade-in slide-in-from-top-1">
          {state.message}
        </div>
      ) : null}

      <Button
        type="submit"
        disabled={pending}
        variant="default"
        size="lg"
        className="w-full mt-3 h-11 bg-sky-500 hover:bg-sky-400 active:scale-[0.98] text-slate-950 font-extrabold shadow-lg shadow-sky-500/25 cursor-pointer rounded-xl transition-all flex items-center justify-center gap-2"
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Memproses...</span>
          </>
        ) : (
          <>
            <span>Masuk ke System</span>
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );
}
```

- [ ] **Step 2: Run type check**

Run: `npx tsc --noEmit`
Expected: No type errors.

- [ ] **Step 3: Commit changes**

```bash
git add src/components/auth/login-form.tsx
git commit -m "style: refine LoginForm component with active scale and crisp focus states"
```

---

### Task 3: Visual Verification

- [ ] **Step 1: Check build & Next.js server compilation**

Run: `npm run build` or `npx next build`
Expected: Build succeeds cleanly.

- [ ] **Step 2: Confirm page layout**

Verify `/login` page renders with split 60/40 layout, background image `bg-login.jpg`, centered glass overlay with "NON CLINICAL INTEGRATED SYSTEM" and "(RSUD KHZ. MUSTHAFA TASIKMALAYA)", and login card positioned on the right.
