import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-slate-300 bg-slate-100 text-slate-800",
        secondary:
          "border-slate-200 bg-slate-50 text-slate-700",
        destructive:
          "border-rose-300 bg-rose-50 text-rose-800 font-bold",
        outline: "border-slate-300 text-slate-700 bg-white",
        success:
          "border-emerald-300 bg-emerald-50 text-emerald-800 font-bold",
        warning:
          "border-amber-300 bg-amber-50 text-amber-900 font-bold",
        info: "border-sky-300 bg-sky-50 text-sky-900 font-bold",
        purple: "border-indigo-300 bg-indigo-50 text-indigo-900 font-bold",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({ className, variant, dot = false, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full animate-pulse",
            variant === "success" && "bg-emerald-600",
            variant === "warning" && "bg-amber-600",
            variant === "destructive" && "bg-rose-600",
            variant === "info" && "bg-sky-600",
            (!variant || variant === "default" || variant === "secondary") && "bg-slate-500"
          )}
        />
      )}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
