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
