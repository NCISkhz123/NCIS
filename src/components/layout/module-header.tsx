"use client";

import { usePathname } from "next/navigation";

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

  const routeMetaMap = pathname.startsWith("/laundry")
    ? LAUNDRY_ROUTE_META
    : CSSD_ROUTE_META;
  const exactMatch = routeMetaMap[pathname];

  if (exactMatch) {
    return exactMatch;
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

  return (
    <header className="border-b border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(246,250,253,0.92)_100%)] px-6 py-6 backdrop-blur md:px-8 md:py-7">
      <div className="space-y-4">
        <div className="flex items-center gap-3 lg:hidden">
          <div className="min-w-0 flex-1">
            <ModuleSwitcher
              compact
              activeModuleKey={activeModuleKey}
              availableModuleKeys={availableModuleKeys}
              modules={NCIS_MODULES}
            />
          </div>
          <LogoutButton
            compact
            logoutAction={logoutAction}
            className="shrink-0"
          />
        </div>

        <div className="space-y-3">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-slate-500">
            Halaman aktif
          </p>
          <h1 className="text-3xl font-semibold tracking-[-0.045em] text-slate-950 text-balance md:text-[2.35rem]">
            {routeMeta.title}
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-slate-600 text-pretty">
            {routeMeta.description}
          </p>
        </div>
      </div>
    </header>
  );
}
