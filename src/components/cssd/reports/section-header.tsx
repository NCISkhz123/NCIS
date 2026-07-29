type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function SectionHeader(props: SectionHeaderProps) {
  return (
    <div className="max-w-3xl">
      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-slate-500">
        {props.eyebrow}
      </p>
      <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-slate-950 text-balance md:text-[2rem]">
        {props.title}
      </h2>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 text-pretty">
        {props.description}
      </p>
    </div>
  );
}
