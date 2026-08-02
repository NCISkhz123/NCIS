import { redirect } from "next/navigation";
import Image from "next/image";

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
        className="object-cover object-center filter brightness-[0.5] contrast-[1.12] scale-[1.01] transition-transform duration-1000"
      />

      {/* UNIFORM SEAMLESS DARK OVERLAY & SCRIM VIGNETTE */}
      <div className="absolute inset-0 bg-slate-950/55" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/30 to-slate-950/70" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/30 to-slate-950/75" />

      {/* DECORATIVE GLOW ORBS */}
      <div className="pointer-events-none absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-sky-500/20 blur-[150px]" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-teal-500/20 blur-[150px]" />

      {/* LEFT BRANDING SECTION (~60% Width Desktop) */}
      <div className="relative z-10 flex min-h-[420px] lg:min-h-[100dvh] w-full lg:w-[58%] xl:w-[62%] flex-col items-center justify-center p-6 sm:p-10 lg:p-14">
        {/* LARGE MODERN HERO TYPOGRAPHY */}
        <div className="w-full max-w-3xl text-center space-y-4">
          {/* Main Headline: Outfit Black Display Font (Extra Large) */}
          <h1 className="font-[var(--font-outfit)] text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight leading-[1.08] uppercase text-white drop-shadow-[0_12px_30px_rgba(0,0,0,0.95)]">
            NON CLINICAL <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-white via-slate-100 to-sky-300 bg-clip-text text-transparent">
              INTEGRATED SYSTEM
            </span>
          </h1>

          {/* Decorative Glowing Accent Bar */}
          <div className="h-1.5 w-28 bg-gradient-to-r from-sky-400 via-teal-400 to-sky-500 rounded-full shadow-[0_0_20px_rgba(56,189,248,0.7)] mx-auto my-5" />

          {/* Subtitle: Space Grotesk Bold Font (Enlarged) */}
          <p className="font-[var(--font-space-grotesk)] text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold tracking-widest text-sky-300 uppercase drop-shadow-[0_4px_14px_rgba(0,0,0,0.95)]">
            RSUD KHZ. MUSTHAFA TASIKMALAYA
          </p>
        </div>
      </div>

      {/* RIGHT LOGIN FORM SECTION (~40% Width Desktop) */}
      <div className="relative z-10 flex w-full lg:w-[42%] xl:w-[38%] flex-col items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-6">
          {/* Form Card */}
          <div className="rounded-3xl border border-slate-800/80 bg-slate-900/90 p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
            <div className="mb-6 space-y-1">
              <h2 className="text-2xl font-black tracking-tight text-white font-[var(--font-outfit)]">Selamat Datang Kembali</h2>
              <p className="text-xs sm:text-sm text-slate-400 font-medium font-[var(--font-space-grotesk)]">
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
