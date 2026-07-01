type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function SectionHeader(props: SectionHeaderProps) {
  return (
    <>
      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-slate-500">
        {props.eyebrow}
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
        {props.title}
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
        {props.description}
      </p>
    </>
  );
}

