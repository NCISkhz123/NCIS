import type { ReactNode } from "react";

type FilterFieldProps = {
  label: string;
  htmlFor: string;
  children: ReactNode;
};

export function FilterField(props: FilterFieldProps) {
  return (
    <div className="grid gap-2.5">
      <label
        htmlFor={props.htmlFor}
        className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-500"
      >
        {props.label}
      </label>
      {props.children}
    </div>
  );
}
