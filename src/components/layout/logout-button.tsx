"use client";

import { LogOut } from "lucide-react";
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
        aria-label="Logout"
        className={cn(
          "inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 text-xs font-semibold text-slate-300 transition-all hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-300 active:scale-[0.98]",
          compact ? "px-3 py-2" : "px-4 py-2.5"
        )}
      >
        <LogOut className="h-4 w-4" />
        <span>Logout</span>
      </button>
    </form>
  );
}
