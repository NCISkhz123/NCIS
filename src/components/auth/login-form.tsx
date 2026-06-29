"use client";

import { useActionState } from "react";

import type { LoginActionState } from "@/app/(auth)/login/actions";

type LoginFormProps = {
  action: (
    state: LoginActionState | null,
    formData: FormData
  ) => Promise<LoginActionState>;
};

export function LoginForm({ action }: LoginFormProps) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-5">
      <label className="grid gap-2 text-sm font-semibold text-slate-700">
        Email
        <input
          name="email"
          type="email"
          autoComplete="email"
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400"
          placeholder="nama@rumahsakit.id"
        />
      </label>

      <label className="grid gap-2 text-sm font-semibold text-slate-700">
        Password
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400"
          placeholder="Masukkan password"
        />
      </label>

      {state?.ok === false ? (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {pending ? "Memproses..." : "Masuk ke CSSD"}
      </button>
    </form>
  );
}
