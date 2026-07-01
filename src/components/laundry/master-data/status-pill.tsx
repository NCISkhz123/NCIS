import { cn } from "@/lib/utils";

type StatusPillProps = {
  active: boolean;
};

export function StatusPill({ active }: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]",
        active
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-500"
      )}
    >
      {active ? "Aktif" : "Nonaktif"}
    </span>
  );
}

