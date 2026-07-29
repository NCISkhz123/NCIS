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
    <section className="rounded-[1.9rem] border border-dashed border-slate-300/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,251,254,0.94)_100%)] px-7 py-11 shadow-sm">
      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-slate-500">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-2xl font-semibold tracking-[-0.035em] text-slate-950 md:text-[2rem]">
        {title}
      </h2>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
        {description}
      </p>
    </section>
  );
}
