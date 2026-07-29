type ShellSectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  size?: "hero" | "panel";
};

export function ShellSectionHeading({
  eyebrow,
  title,
  description,
  size = "panel",
}: ShellSectionHeadingProps) {
  const isHero = size === "hero";

  return (
    <div className={isHero ? "max-w-2xl space-y-2" : "max-w-xl space-y-1.5"}>
      <p className="text-xs font-bold uppercase tracking-wider text-slate-700">
        {eyebrow}
      </p>
      <h2
        className={
          isHero
            ? "text-2xl font-bold tracking-tight text-slate-900 text-balance md:text-3xl"
            : "text-xl font-bold tracking-tight text-slate-900 text-balance"
        }
      >
        {title}
      </h2>
      {description ? (
        <p
          className={
            isHero
              ? "text-sm leading-relaxed text-slate-700 font-medium"
              : "text-xs md:text-sm leading-relaxed text-slate-700 font-medium"
          }
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
