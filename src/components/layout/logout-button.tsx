"use client";

import { cn } from "@/lib/utils";

type LogoutButtonProps = {
  logoutAction: () => Promise<void>;
  className?: string;
  compact?: boolean;
};

export function LogoutButton({
  logoutAction,
  className,
  compact = false,
}: LogoutButtonProps) {
  return (
    <form action={logoutAction} className={className}>
      <button
        type="submit"
        className={cn(
          "w-full rounded-full border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-white hover:text-slate-950",
          compact ? "px-3 py-2" : "px-4 py-2.5"
        )}
      >
        Logout
      </button>
    </form>
  );
}
