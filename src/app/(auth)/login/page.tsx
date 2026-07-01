import { redirect } from "next/navigation";

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
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#f4f8fb_0%,#edf3f7_38%,#f8fbfd_100%)] px-6 py-12">
      <section className="w-full max-w-md rounded-[2rem] border border-slate-200/90 bg-white/95 p-8 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="space-y-3">
          <p className="text-xl font-bold uppercase tracking-[0.34em] text-slate-700">
            NCIS
          </p>
          <p className="text-sm font-medium text-slate-500">
            Non Clinical Integrated System
          </p>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-[-0.03em] text-slate-950">
              Login CSSD
            </h1>
            <p className="text-sm leading-6 text-slate-600">
              Masuk untuk melanjutkan pencatatan gudang, distribusi, pengembalian,
              dan stok opname CSSD di NCIS.
            </p>
          </div>
        </div>

        <div className="mt-8">
          <LoginForm action={loginAction} />
        </div>
      </section>
    </main>
  );
}
