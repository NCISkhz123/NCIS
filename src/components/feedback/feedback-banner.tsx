import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type FeedbackBannerTone = "error" | "success" | "info";

type FeedbackBannerProps = {
  tone: FeedbackBannerTone;
  label?: string;
  children: ReactNode;
  className?: string;
};

const toneConfig: Record<
  FeedbackBannerTone,
  {
    container: string;
    label: string;
    body: string;
    icon: typeof AlertCircle;
  }
> = {
  error: {
    container: "border-rose-200 bg-rose-50/90 text-rose-900 shadow-2xs",
    label: "text-rose-700",
    body: "text-rose-800",
    icon: AlertCircle,
  },
  success: {
    container: "border-emerald-200 bg-emerald-50/90 text-emerald-900 shadow-2xs",
    label: "text-emerald-700",
    body: "text-emerald-800",
    icon: CheckCircle2,
  },
  info: {
    container: "border-sky-200 bg-sky-50/90 text-sky-900 shadow-2xs",
    label: "text-sky-700",
    body: "text-sky-800",
    icon: Info,
  },
};

export function FeedbackBanner({
  tone,
  label,
  children,
  className,
}: FeedbackBannerProps) {
  const config = toneConfig[tone];
  const IconComponent = config.icon;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-2xl border p-4 transition-all animate-in fade-in-50",
        config.container,
        className
      )}
    >
      <div className="mt-0.5 shrink-0">
        <IconComponent className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1 space-y-0.5">
        {label ? (
          <p className={cn("text-xs font-bold uppercase tracking-wider", config.label)}>
            {label}
          </p>
        ) : null}
        <div className={cn("text-xs font-medium leading-relaxed", config.body)}>
          {children}
        </div>
      </div>
    </div>
  );
}
