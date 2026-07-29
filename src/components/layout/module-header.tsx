"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layers, Settings } from "lucide-react";

import { LogoutButton } from "@/components/layout/logout-button";
import { ModuleSwitcher } from "@/components/layout/module-switcher";
import { NCIS_MODULES, CSSD_ROUTE_META } from "@/lib/cssd/constants";
import { LAUNDRY_ROUTE_META } from "@/lib/laundry/constants";
import type { ModuleKey } from "@/lib/modules";

type ModuleHeaderProps = {
  activeModuleKey: ModuleKey;
  availableModuleKeys: readonly ModuleKey[];
  logoutAction: () => Promise<void>;
};

function getRouteMeta(pathname: string) {
  const routeMetaMap = pathname.startsWith("/laundry")
    ? LAUNDRY_ROUTE_META
    : CSSD_ROUTE_META;
  const exactMatch = routeMetaMap[pathname];

  if (exactMatch) {
    return exactMatch;
  }

  if (pathname.startsWith("/laundry/master-data")) {
    return LAUNDRY_ROUTE_META["/laundry/master-data/items"];
  }

  if (pathname.startsWith("/laundry/laporan")) {
    return LAUNDRY_ROUTE_META["/laundry/laporan"];
  }

  if (pathname.startsWith("/cssd/master-data")) {
    return CSSD_ROUTE_META["/cssd/master-data/items"];
  }

  if (pathname.startsWith("/cssd/laporan")) {
    return CSSD_ROUTE_META["/cssd/laporan"];
  }

  return pathname.startsWith("/laundry")
    ? LAUNDRY_ROUTE_META["/laundry"]
    : CSSD_ROUTE_META["/cssd"];
}

export function ModuleHeader({
  activeModuleKey,
  availableModuleKeys,
  logoutAction,
}: ModuleHeaderProps) {
  const pathname = usePathname();
  const routeMeta = getRouteMeta(pathname);
  const isLaundry = pathname.startsWith("/laundry");
  const settingHref = isLaundry ? "/laundry/setting" : "/cssd/setting";

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-6 py-5 backdrop-blur-md md:px-8 shadow-2xs">
      <div className="space-y-3">
        {/* Mobile Header Bar */}
        <div className="flex items-center gap-3 lg:hidden">
          <div className="min-w-0 flex-1">
            <ModuleSwitcher
              compact
              activeModuleKey={activeModuleKey}
              availableModuleKeys={availableModuleKeys}
              modules={NCIS_MODULES}
            />
          </div>
          <Link
            href={settingHref}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-2xs transition hover:bg-slate-50"
          >
            <Settings className="h-3.5 w-3.5 text-slate-600" />
            <span>Setting</span>
          </Link>
          <LogoutButton
            compact
            logoutAction={logoutAction}
            className="shrink-0"
          />
        </div>

        {/* Desktop Header Info */}
        <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-sky-50 px-2.5 py-1 font-mono text-xs font-bold tracking-wider text-sky-900 border border-sky-300">
                <Layers className="h-3.5 w-3.5 text-sky-700" />
                {isLaundry ? "MODUL LAUNDRY" : "MODUL CSSD"}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-semibold text-slate-600">
                {pathname}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              {routeMeta.title}
            </h1>
            <p className="max-w-2xl text-xs md:text-sm font-medium text-slate-600 leading-relaxed">
              {routeMeta.description}
            </p>
          </div>

          <div className="hidden md:flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>Sistem Sterilisasi Terhubung</span>
          </div>
        </div>
      </div>
    </header>
  );
}
