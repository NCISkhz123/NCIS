"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layers, Settings, Shirt, Ambulance } from "lucide-react";

import { LogoutButton } from "@/components/layout/logout-button";
import { ModuleSwitcher } from "@/components/layout/module-switcher";
import { Badge } from "@/components/ui/badge";
import { NCIS_MODULES, CSSD_ROUTE_META } from "@/lib/cssd/constants";
import { LAUNDRY_ROUTE_META } from "@/lib/laundry/constants";
import { AMBULANCE_ROUTE_META } from "@/lib/ambulance/constants";
import type { ModuleKey } from "@/lib/modules";

type ModuleHeaderProps = {
  activeModuleKey: ModuleKey;
  availableModuleKeys: readonly ModuleKey[];
  logoutAction: () => Promise<void>;
};

function getRouteMeta(pathname: string) {
  const routeMetaMap = pathname.startsWith("/ambulance")
    ? AMBULANCE_ROUTE_META
    : pathname.startsWith("/laundry")
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

  if (pathname.startsWith("/ambulance/master")) {
    return AMBULANCE_ROUTE_META["/ambulance/master"];
  }

  if (pathname.startsWith("/ambulance/history")) {
    return AMBULANCE_ROUTE_META["/ambulance/history"];
  }

  return pathname.startsWith("/ambulance")
    ? AMBULANCE_ROUTE_META["/ambulance/order"]
    : pathname.startsWith("/laundry")
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
  const isAmbulance = pathname.startsWith("/ambulance");
  const isLaundry = pathname.startsWith("/laundry");
  const settingHref = isAmbulance ? "/ambulance/master" : isLaundry ? "/laundry/setting" : "/cssd/setting";

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
        <div className="flex flex-col gap-3 mt-2">
          <div className="flex items-center">
            <Badge variant="info" className="uppercase tracking-widest text-[10px]">
              {isAmbulance ? (
                <Ambulance className="mr-1.5 h-3 w-3" />
              ) : isLaundry ? (
                <Shirt className="mr-1.5 h-3 w-3" />
              ) : (
                <Layers className="mr-1.5 h-3 w-3" />
              )}
              {isAmbulance ? "Modul Ambulance" : isLaundry ? "Modul Laundry" : "Modul CSSD"}
            </Badge>
          </div>
          <div className="space-y-1.5">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
              {routeMeta?.title || "Judul Halaman"}
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
}
