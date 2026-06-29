type EmptyStateProps = {
  eyebrow?: string;
  title: string;
  description: string;
};

export function EmptyState({
  eyebrow = "Segera Hadir",
  title,
  description,
}: EmptyStateProps) {
  return (
    <section className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white/80 px-6 py-10 shadow-sm">
      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-slate-500">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
        {title}
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
        {description}
      </p>
    </section>
  );
}
