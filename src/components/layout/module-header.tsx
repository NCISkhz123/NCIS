"use client";

import { usePathname } from "next/navigation";

import { NCIS_MODULES, CSSD_ROUTE_META } from "@/lib/cssd/constants";
import { cn } from "@/lib/utils";

type ModuleHeaderProps = {
  roleLabel: string;
  email: string | null;
  logoutAction: () => Promise<void>;
};

function getRouteMeta(pathname: string) {
  const exactMatch =
    CSSD_ROUTE_META[pathname as keyof typeof CSSD_ROUTE_META];

  if (exactMatch) {
    return exactMatch;
  }

  if (pathname.startsWith("/cssd/master-data")) {
    return CSSD_ROUTE_META["/cssd/master-data/items"];
  }

  if (pathname.startsWith("/cssd/laporan")) {
    return CSSD_ROUTE_META["/cssd/laporan"];
  }

  return CSSD_ROUTE_META["/cssd"];
}

export function ModuleHeader({
  roleLabel,
  email,
  logoutAction,
}: ModuleHeaderProps) {
  const pathname = usePathname();
  const routeMeta = getRouteMeta(pathname);

  return (
    <header className="flex flex-col gap-5 border-b border-slate-200/80 bg-white/85 px-6 py-6 backdrop-blur md:px-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-slate-500">
            Global Context
          </p>
          <div>
            <h1 className="text-3xl font-semibold tracking-[-0.03em] text-slate-950">
              {routeMeta.title}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              {routeMeta.description}
            </p>
          </div>
        </div>

        <div className="grid gap-3 lg:min-w-[21rem]">
          <section className="rounded-[1.35rem] border border-slate-200 bg-slate-50/90 p-4">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-slate-500">
              Pilih Modul
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {NCIS_MODULES.map((module) => (
                <span
                  key={module.key}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                    module.active
                      ? "border-slate-900 bg-slate-950 text-white"
                      : "border-slate-200 bg-white text-slate-500"
                  )}
                >
                  {module.label}
                </span>
              ))}
            </div>
          </section>

          <div className="flex items-center justify-end gap-3">
            <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-right shadow-sm">
              <p className="text-sm font-semibold text-slate-900">{roleLabel}</p>
              <p className="text-xs text-slate-500">
                {email ?? "Profil belum memiliki email"}
              </p>
            </div>

            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-950"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </div>
    </header>
  );
}
