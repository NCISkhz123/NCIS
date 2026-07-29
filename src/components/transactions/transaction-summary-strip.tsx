import { cn } from "@/lib/utils";
import { Activity, History, PackageCheck } from "lucide-react";

type TransactionSummaryItem = {
  label: string;
  value: string | number;
  helper?: string;
  accent?: "default" | "emphasis";
};

type TransactionSummaryStripProps = {
  items: TransactionSummaryItem[];
  className?: string;
};

export function TransactionSummaryStrip({
  items,
  className,
}: TransactionSummaryStripProps) {
  return (
    <div
      className={cn(
        "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {items.map((item, index) => {
        const IconComponent =
          index === 0 ? Activity : index === 1 ? History : PackageCheck;

        return (
          <article
            key={item.label}
            className={cn(
              "group relative overflow-hidden rounded-2xl border p-5 transition-all duration-200 hover:shadow-md",
              item.accent === "emphasis"
                ? "border-sky-300 bg-sky-50/50 shadow-xs"
                : "border-slate-200 bg-white"
            )}
          >
            <div className="flex items-center justify-between">
              <p className="font-mono text-xs font-bold uppercase tracking-wider text-slate-700">
                {item.label}
              </p>
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-xl transition-colors",
                  item.accent === "emphasis"
                    ? "bg-sky-600 text-white"
                    : "bg-slate-100 text-slate-700 group-hover:bg-sky-50 group-hover:text-sky-700"
                )}
              >
                <IconComponent className="h-4 w-4" />
              </div>
            </div>

            <p className="mt-3 font-mono text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
              {item.value}
            </p>

            {item.helper ? (
              <p className="mt-1.5 text-xs text-slate-600 font-medium leading-relaxed">
                {item.helper}
              </p>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
