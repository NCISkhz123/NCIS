import { redirect } from "next/navigation";
import { Activity } from "lucide-react";

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
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 py-12 text-slate-100">
      {/* Background Glow */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-sky-600/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-teal-600/15 blur-3xl" />

      <div className="relative z-10 w-full max-w-md space-y-6">
        {/* Brand Badge */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1.5 text-xs font-bold tracking-wider text-sky-400">
            <Activity className="h-4 w-4 animate-pulse text-sky-400" />
            NCIS HEALTHCARE PLATFORM
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Sistem Terpadu NCIS
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-300">
            Non Clinical Integrated System — CSSD & Laundry Operational Portal
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
          <div className="mb-6 space-y-1">
            <h2 className="text-xl font-bold text-white">Selamat Datang Kembali</h2>
            <p className="text-xs text-slate-300 font-medium">
              Masuk dengan akun terdaftar untuk mengakses portal sterilisasi & logistik.
            </p>
          </div>

          <LoginForm action={loginAction} />
        </div>

        {/* Demo Credentials Info Box */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-center">
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
            Akun Demo Lokal Ready:
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-2 text-xs font-mono text-slate-200">
            <span className="rounded-md border border-slate-700 bg-slate-800 px-2.5 py-1">
              admin.cssd@ncis.local
            </span>
            <span className="rounded-md border border-slate-700 bg-slate-800 px-2.5 py-1">
              petugas.cssd@ncis.local
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
