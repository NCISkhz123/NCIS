import { Inbox } from "lucide-react";

type EmptyStateProps = {
  eyebrow?: string;
  title: string;
  description: string;
};

export function EmptyState({
  eyebrow = "Area Kerja",
  title,
  description,
}: EmptyStateProps) {
  return (
    <section className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300/80 bg-white/60 px-8 py-14 text-center shadow-xs backdrop-blur-xs">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 border border-sky-200/60 shadow-2xs">
        <Inbox className="h-6 w-6" />
      </div>
      <p className="mt-4 font-mono text-[0.7rem] font-semibold uppercase tracking-widest text-slate-400">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
        {title}
      </h2>
      <p className="mt-2 max-w-md text-xs text-slate-500 leading-relaxed md:text-sm">
        {description}
      </p>
    </section>
  );
}
