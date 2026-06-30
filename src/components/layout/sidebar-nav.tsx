"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { CSSD_NAV_ITEMS } from "@/lib/cssd/constants";
import { cn } from "@/lib/utils";

type SidebarNavProps = {
  pathname: string;
};

function createInitialOpenGroups(pathname: string) {
  return Object.fromEntries(
    CSSD_NAV_ITEMS.filter((item) => item.type === "group").map((item) => [
      item.segment,
      pathname.startsWith(item.segment),
    ])
  );
}

export function SidebarNav({ pathname }: SidebarNavProps) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    createInitialOpenGroups(pathname)
  );

  useEffect(() => {
    setOpenGroups((current) => {
      const nextState = { ...current };
      let hasChanged = false;

      for (const item of CSSD_NAV_ITEMS) {
        if (item.type !== "group" || !pathname.startsWith(item.segment) || current[item.segment]) {
          continue;
        }

        nextState[item.segment] = true;
        hasChanged = true;
      }

      return hasChanged ? nextState : current;
    });
  }, [pathname]);

  return (
    <nav aria-label="Navigasi CSSD" className="flex flex-col gap-3">
      {CSSD_NAV_ITEMS.map((item) => {
        if (item.type === "group") {
          const isGroupActive = pathname.startsWith(item.segment);
          const isGroupOpen = isGroupActive || openGroups[item.segment];

          return (
            <div
              key={item.label}
              className={cn(
                "rounded-[1.15rem] border px-3 py-3 transition-colors",
                isGroupActive
                  ? "border-white/18 bg-white/10"
                  : "border-white/8 bg-white/5"
              )}
            >
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 rounded-xl px-2 py-1 text-left"
                onClick={() =>
                  setOpenGroups((current) => ({
                    ...current,
                    [item.segment]: !current[item.segment],
                  }))
                }
                aria-expanded={isGroupOpen}
              >
                <span className="text-sm font-semibold tracking-[0.02em] text-slate-50">
                  {item.label}
                </span>
                <span className="text-xs uppercase tracking-[0.24em] text-slate-300">
                  {isGroupOpen ? "Hide" : "Show"}
                </span>
              </button>

              {isGroupOpen ? (
                <div className="mt-3 border-t border-white/10 pt-3">
                  <div className="grid gap-2">
                    {item.children.map((child) => {
                      const isActive = pathname === child.href;

                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            "rounded-xl px-3 py-2 text-sm transition-colors",
                            isActive
                              ? "bg-white text-slate-950 shadow-sm"
                              : "bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white"
                          )}
                        >
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          );
        }

        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-[1rem] border px-4 py-3 text-sm font-medium transition-colors",
              isActive
                ? "border-white/18 bg-white text-slate-950 shadow-sm"
                : "border-white/8 bg-white/5 text-slate-100 hover:bg-white/10 hover:text-white"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
