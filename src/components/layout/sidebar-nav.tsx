"use client";

import Link from "next/link";
import {
  ChevronDown,
  Package,
  Truck,
  RotateCcw,
  PackageMinus,
  ClipboardCheck,
  Database,
  FileText,
  Settings,
  Layers,
  Shirt,
  Ambulance,
} from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";

import { CSSD_NAV_ITEMS } from "@/lib/cssd/constants";
import { LAUNDRY_NAV_ITEMS } from "@/lib/laundry/constants";
import { AMBULANCE_NAV_ITEMS } from "@/lib/ambulance/constants";
import type { AppRole } from "@/lib/auth/roles";
import { cn } from "@/lib/utils";

type SidebarNavProps = {
  pathname?: string;
  role?: AppRole;
};

function isPetugasRole(role: AppRole | undefined) {
  return role === "PETUGAS_CSSD" || role === "PETUGAS_LAUNDRY" || role === "PETUGAS_AMBULANCE";
}

function getNavIcon(segmentOrHref: string) {
  if (segmentOrHref.includes("pemasukan")) return Package;
  if (segmentOrHref.includes("distribusi")) return Truck;
  if (segmentOrHref.includes("pengembalian")) return RotateCcw;
  if (segmentOrHref.includes("pemakaian-internal")) return PackageMinus;
  if (segmentOrHref.includes("stok-opname")) return ClipboardCheck;
  if (segmentOrHref.includes("master-data") || segmentOrHref.includes("master")) return Database;
  if (segmentOrHref.includes("laporan") || segmentOrHref.includes("history")) return FileText;
  if (segmentOrHref.includes("setting")) return Settings;
  if (segmentOrHref.includes("laundry")) return Shirt;
  if (segmentOrHref.includes("ambulance") || segmentOrHref.includes("order")) return Ambulance;
  return Layers;
}

function getNavItems(pathname: string, role?: AppRole) {
  if (pathname.startsWith("/ambulance")) return AMBULANCE_NAV_ITEMS;
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

export function SidebarNav({ pathname: propPathname, role }: SidebarNavProps) {
  const hookPathname = usePathname();
  const pathname = propPathname || hookPathname || "";
  const navItems = getNavItems(pathname, role);
  const activeOpenGroups = createInitialOpenGroups(pathname, role);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  return (
    <nav
      aria-label={
        pathname.startsWith("/ambulance")
          ? "Navigasi Ambulance"
          : pathname.startsWith("/laundry")
          ? "Navigasi Laundry"
          : "Navigasi CSSD"
      }
      className="flex flex-col gap-2.5"
    >
      {navItems.map((item) => {
        const IconComponent = getNavIcon(item.type === "group" ? item.segment : item.href);

        if (item.type === "group") {
          const isGroupActive = pathname.startsWith(item.segment);
          const isGroupOpen =
            openGroups[item.segment] ?? activeOpenGroups[item.segment] ?? false;

          return (
            <div key={item.label} className="flex flex-col gap-1">
              <button
                type="button"
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-xl px-3.5 py-3 text-left transition-all duration-200 cursor-pointer",
                  isGroupActive
                    ? "bg-sky-500/10 text-sky-100"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                )}
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
                  <IconComponent
                    className={cn(
                      "h-5 w-5",
                      isGroupActive ? "text-sky-400" : "text-slate-400"
                    )}
                  />
                  <span className="text-sm font-medium tracking-wide">
                    {item.label}
                  </span>
                </div>

                <ChevronDown
                  aria-hidden="true"
                  className={cn(
                    "h-4 w-4 shrink-0 transition-transform duration-200 opacity-70",
                    isGroupOpen ? "rotate-180 text-sky-400" : "text-slate-400"
                  )}
                />
              </button>

              {isGroupOpen ? (
                <div className="pl-[2.65rem] pr-3 pb-1 pt-1.5">
                  <div className="grid gap-1.5 border-l border-white/10 pl-3.5">
                    {item.children.map((child) => {
                      const isActive = pathname === child.href;

                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            "flex items-center gap-2 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-150",
                            isActive
                              ? "bg-sky-500/15 text-sky-400 font-semibold"
                              : "text-slate-400 hover:bg-white/10 hover:text-slate-200"
                          )}
                        >
                          <span
                            className={cn(
                              "h-1 w-1 rounded-full",
                              isActive ? "bg-sky-400" : "bg-transparent"
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
              "flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-sky-500/15 text-sky-400 font-semibold shadow-sm"
                : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
            )}
          >
            <IconComponent
              className={cn(
                "h-5 w-5",
                isActive ? "text-sky-400" : "text-slate-400"
              )}
            />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
