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
    <main className="relative flex min-h-[100dvh] w-full flex-col lg:flex-row bg-slate-950 text-slate-100 overflow-hidden antialiased">
      {/* UNIFORM FULL SCREEN BACKGROUND AERIAL PHOTOGRAPHY */}
      <Image
        src="/bg-login.jpg"
        alt="RSUD KHZ. Musthafa Tasikmalaya Aerial View"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center filter brightness-[0.52] contrast-[1.1] scale-[1.01] transition-transform duration-1000"
      />

      {/* UNIFORM SEAMLESS DARK OVERLAYS ACROSS ENTIRE CANVAS */}
      <div className="absolute inset-0 bg-slate-950/60" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/60" />

      {/* DECORATIVE GLOW ORBS */}
      <div className="pointer-events-none absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-sky-500/15 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-teal-500/15 blur-[120px]" />

      {/* LEFT BRANDING SECTION (~60% Width Desktop) */}
      <div className="relative z-10 flex min-h-[420px] lg:min-h-[100dvh] w-full lg:w-[58%] xl:w-[62%] flex-col items-center justify-center p-6 sm:p-10 lg:p-14">
        {/* WIDE HORIZONTAL OVERLAY CONTAINER (BORDERLESS GLASS) */}
        <div className="w-full max-w-3xl text-center">
          <div className="relative rounded-3xl bg-slate-950/40 p-6 sm:p-10 backdrop-blur-md transition-all duration-300">
            {/* Top Chip / Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1.5 text-xs font-bold tracking-widest text-sky-400 uppercase shadow-inner mb-5">
              <Activity className="h-4 w-4 animate-pulse text-sky-400" />
              <span>NCIS HEALTHCARE PLATFORM</span>
            </div>

            {/* Main Headline: Plus Jakarta Sans (Bold) */}
            <h1 className="font-[var(--font-plus-jakarta)] text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-snug uppercase">
              NON CLINICAL INTEGRATED SYSTEM
            </h1>

            {/* Subtitle: Roboto (Regular) */}
            <div className="mt-3.5 flex items-center justify-center gap-2 font-[var(--font-roboto)] text-base sm:text-lg lg:text-xl font-normal text-sky-200 tracking-wide">
              <Hospital className="h-5 w-5 text-sky-400 shrink-0" />
              <span>RSUD KHZ. MUSTHAFA TASIKMALAYA</span>
            </div>

            {/* Subtle Divider */}
            <div className="my-5 mx-auto h-px w-32 bg-gradient-to-r from-transparent via-sky-500/40 to-transparent" />

            {/* Description Subtext */}
            <p className="text-xs sm:text-sm font-medium text-slate-300 leading-relaxed max-w-xl mx-auto">
              Portal Operasional Terpadu untuk Manajemen Sterilisasi Sentral (CSSD), Laundry & Distribusi Logistik Non-Klinis.
            </p>

            {/* Security Pill */}
            <div className="mt-5 inline-flex items-center gap-2 text-[11px] font-mono text-slate-400 bg-slate-900/50 px-3.5 py-1 rounded-full border border-slate-800/80">
              <ShieldCheck className="h-3.5 w-3.5 text-teal-400" />
              <span>Enkripsi Sesi End-to-End RSUD</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT LOGIN FORM SECTION (~40% Width Desktop) */}
      <div className="relative z-10 flex w-full lg:w-[42%] xl:w-[38%] flex-col items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-6">
          {/* Form Card */}
          <div className="rounded-3xl border border-slate-800/80 bg-slate-900/90 p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
            <div className="mb-6 space-y-1">
              <h2 className="text-2xl font-black tracking-tight text-white font-[var(--font-plus-jakarta)]">Selamat Datang Kembali</h2>
              <p className="text-xs sm:text-sm text-slate-400 font-medium font-[var(--font-roboto)]">
                Masukan kredensial terdaftar Anda untuk mengakses portal.
              </p>
            </div>

            <LoginForm action={loginAction} />
          </div>

          {/* Demo Credentials Info Box */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4 text-center backdrop-blur-md">
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
