import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-slate-900 text-white shadow-sm hover:bg-slate-800 active:bg-slate-950",
        primary:
          "bg-sky-600 text-white shadow-sm hover:bg-sky-700 active:bg-sky-800",
        destructive:
          "bg-rose-600 text-white shadow-sm hover:bg-rose-700 active:bg-rose-800",
        outline:
          "border border-slate-300 bg-white text-slate-800 shadow-xs hover:bg-slate-50 hover:text-slate-900 border-slate-300",
        secondary:
          "bg-slate-100 text-slate-900 hover:bg-slate-200 active:bg-slate-300",
        ghost: "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
        link: "text-sky-700 underline-offset-4 hover:underline font-bold",
        success:
          "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 active:bg-emerald-800",
        amber:
          "bg-amber-600 text-white shadow-sm hover:bg-amber-700 active:bg-amber-800",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-2xl px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    if (asChild && React.isValidElement(children)) {
      const childElement = children as React.ReactElement<{ className?: string }>;
      const childClassName = childElement.props?.className;

      return React.cloneElement(childElement, {
        className: cn(buttonVariants({ variant, size }), className, childClassName),
        ...props,
      });
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
