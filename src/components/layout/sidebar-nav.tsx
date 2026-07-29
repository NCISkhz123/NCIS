"use client";

import Link from "next/link";
import {
  ChevronDown,
  Package,
  Truck,
  RotateCcw,
  Wrench,
  ClipboardCheck,
  Database,
  FileText,
  Settings,
  Layers,
  Shirt,
} from "lucide-react";
import { useState } from "react";

import { CSSD_NAV_ITEMS } from "@/lib/cssd/constants";
import { LAUNDRY_NAV_ITEMS } from "@/lib/laundry/constants";
import type { AppRole } from "@/lib/auth/roles";
import { cn } from "@/lib/utils";

type SidebarNavProps = {
  pathname: string;
  role?: AppRole;
};

function isPetugasRole(role: AppRole | undefined) {
  return role === "PETUGAS_CSSD" || role === "PETUGAS_LAUNDRY";
}

function getNavIcon(segmentOrHref: string) {
  if (segmentOrHref.includes("pemasukan")) return Package;
  if (segmentOrHref.includes("distribusi")) return Truck;
  if (segmentOrHref.includes("pengembalian")) return RotateCcw;
  if (segmentOrHref.includes("pemakaian-internal")) return Wrench;
  if (segmentOrHref.includes("stok-opname")) return ClipboardCheck;
  if (segmentOrHref.includes("master-data")) return Database;
  if (segmentOrHref.includes("laporan")) return FileText;
  if (segmentOrHref.includes("setting")) return Settings;
  if (segmentOrHref.includes("laundry")) return Shirt;
  return Layers;
}

function getNavItems(pathname: string, role?: AppRole) {
  const navItems = pathname.startsWith("/laundry")
    ? LAUNDRY_NAV_ITEMS
    : CSSD_NAV_ITEMS;

  if (!isPetugasRole(role)) {
    return navItems;
  }

  return navItems.filter(
    (item) => item.type !== "group" || !item.segment.endsWith("/master-data")
  );
}

function createInitialOpenGroups(pathname: string, role?: AppRole) {
  const navItems = getNavItems(pathname, role);

  return Object.fromEntries(
    navItems.filter((item) => item.type === "group").map((item) => [
      item.segment,
      pathname.startsWith(item.segment),
    ])
  );
}

export function SidebarNav({ pathname, role }: SidebarNavProps) {
  const navItems = getNavItems(pathname, role);
  const activeOpenGroups = createInitialOpenGroups(pathname, role);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  return (
    <nav
      aria-label={pathname.startsWith("/laundry") ? "Navigasi Laundry" : "Navigasi CSSD"}
      className="flex flex-col gap-2"
    >
      {navItems.map((item) => {
        const IconComponent = getNavIcon(item.type === "group" ? item.segment : item.href);

        if (item.type === "group") {
          const isGroupActive = pathname.startsWith(item.segment);
          const isGroupOpen =
            openGroups[item.segment] ?? activeOpenGroups[item.segment] ?? false;

          return (
            <div
              key={item.label}
              className={cn(
                "rounded-2xl border transition-all duration-200",
                isGroupActive
                  ? "border-sky-500/30 bg-sky-500/10 shadow-xs"
                  : "border-white/5 bg-white/[0.03] hover:border-white/10 hover:bg-white/[0.05]"
              )}
            >
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 px-3.5 py-3 text-left"
                onClick={() =>
                  setOpenGroups((current) => {
                    const currentOpen =
                      current[item.segment] ??
                      activeOpenGroups[item.segment] ??
                      false;

                    return {
                      ...current,
                      [item.segment]: !currentOpen,
                    };
                  })
                }
                aria-expanded={isGroupOpen}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
                      isGroupActive
                        ? "bg-sky-500 text-white"
                        : "bg-white/10 text-slate-400"
                    )}
                  >
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-semibold tracking-wide text-slate-100">
                    {item.label}
                  </span>
                </div>

                <ChevronDown
                  aria-hidden="true"
                  className={cn(
                    "h-4 w-4 shrink-0 transition-transform duration-200",
                    isGroupOpen
                      ? "rotate-180 text-sky-400"
                      : "text-slate-400"
                  )}
                />
              </button>

              {isGroupOpen ? (
                <div className="border-t border-white/10 px-3 py-2">
                  <div className="grid gap-1 pl-2 border-l border-white/10">
                    {item.children.map((child) => {
                      const isActive = pathname === child.href;

                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            "flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-all duration-150",
                            isActive
                              ? "bg-white text-slate-950 font-semibold shadow-xs"
                              : "text-slate-300 hover:bg-white/10 hover:text-white"
                          )}
                        >
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              isActive ? "bg-sky-600" : "bg-slate-500"
                            )}
                          />
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
              "flex items-center gap-3 rounded-2xl border px-3.5 py-3 text-sm font-medium transition-all duration-200",
              isActive
                ? "border-sky-500/40 bg-white text-slate-950 shadow-md font-semibold"
                : "border-white/5 bg-white/[0.03] text-slate-200 hover:border-white/10 hover:bg-white/[0.08] hover:text-white"
            )}
          >
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
                isActive
                  ? "bg-sky-600 text-white"
                  : "bg-white/10 text-slate-400"
              )}
            >
              <IconComponent className="h-4 w-4" />
            </div>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
