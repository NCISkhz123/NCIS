import * as React from "react";
import { cn } from "@/lib/utils";

const Select = React.forwardRef<
  HTMLSelectElement,
  React.ComponentProps<"select">
>(({ className, children, ...props }, ref) => {
  return (
    <div className="relative w-full">
      <select
        className={cn(
          "flex h-11 w-full appearance-none rounded-xl border border-slate-300 bg-white px-3.5 py-2 pr-9 text-sm text-slate-900 font-medium shadow-xs transition-colors focus-visible:border-sky-600 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-sky-600/20 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">
        ▼
      </span>
    </div>
  );
});
Select.displayName = "Select";

export { Select };
