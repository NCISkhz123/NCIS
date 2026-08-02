import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode, ElementType } from "react";
import { Download, FileSpreadsheet, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

type ReportActionVariant = "export" | "neutral" | "disabled";

type ReportActionLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  variant?: Exclude<ReportActionVariant, "disabled">;
  icon?: ElementType;
};

type ReportActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ReportActionVariant;
  icon?: ElementType;
};

const actionBaseClass =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold tracking-wide transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 active:scale-[0.98]";

const actionVariantClass: Record<ReportActionVariant, string> = {
  export:
    "border-emerald-300 bg-emerald-600 text-white shadow-xs hover:bg-emerald-700 active:bg-emerald-800",
  neutral:
    "border-slate-200 bg-white text-slate-700 shadow-xs hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300",
  disabled:
    "border-slate-200 bg-slate-100 text-slate-400 opacity-50 cursor-not-allowed active:scale-100",
};

export function ReportActionLink({
  children,
  className,
  variant = "neutral",
  icon,
  ...props
}: ReportActionLinkProps) {
  const DefaultIcon = children === "Reset" ? RotateCcw : Download;
  const Icon = icon || DefaultIcon;

  return (
    <a
      className={cn(
        actionBaseClass,
        actionVariantClass[variant],
        className
      )}
      {...props}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{children}</span>
    </a>
  );
}

export function ReportActionButton({
  children,
  className,
  type = "button",
  variant = "neutral",
  icon,
  ...props
}: ReportActionButtonProps) {
  const DefaultIcon = children === "Reset" ? RotateCcw : FileSpreadsheet;
  const Icon = icon || DefaultIcon;

  return (
    <button
      type={type}
      className={cn(
        actionBaseClass,
        actionVariantClass[variant],
        props.disabled ? actionVariantClass.disabled : null,
        className
      )}
      {...props}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{children}</span>
    </button>
  );
}
