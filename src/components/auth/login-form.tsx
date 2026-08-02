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
          className="text-xs font-semibold uppercase tracking-wider text-slate-200"
        >
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="email-input"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="flex h-11 w-full rounded-xl border border-slate-700 bg-slate-900 pl-10 pr-4 text-sm text-white font-medium placeholder-slate-400 shadow-xs transition-colors focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
            placeholder="nama@ncis.local"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="password-input"
          className="text-xs font-semibold uppercase tracking-wider text-slate-200"
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
            className="flex h-11 w-full rounded-xl border border-slate-700 bg-slate-900 pl-10 pr-4 text-sm text-white font-medium placeholder-slate-400 shadow-xs transition-colors focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
            placeholder="••••••••"
          />
        </div>
      </div>

      {state?.ok === false ? (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/20 p-3 text-xs font-bold text-rose-200">
          {state.message}
        </div>
      ) : null}

      <Button
        type="submit"
        disabled={pending}
        variant="default"
        size="lg"
        className="w-full mt-2"
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Masuk...</span>
          </>
        ) : (
          <>
            <span>Masuk</span>
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );
}
