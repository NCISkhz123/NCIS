import type { ReactNode } from "react";

type FilterFieldProps = {
  label: string;
  htmlFor: string;
  children: ReactNode;
};

export function FilterField(props: FilterFieldProps) {
  return (
    <div className="grid gap-2">
      <label htmlFor={props.htmlFor} className="text-sm font-semibold text-slate-700">
        {props.label}
      </label>
      {props.children}
    </div>
  );
}
