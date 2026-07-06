"use client";

import { usePathname } from "next/navigation";

import { LogoutButton } from "@/components/layout/logout-button";
import { ModuleSwitcher } from "@/components/layout/module-switcher";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { NCIS_MODULES } from "@/lib/cssd/constants";
import type { ModuleKey } from "@/lib/modules";

type AppSidebarProps = {
  activeModuleKey: ModuleKey;
  availableModuleKeys: readonly ModuleKey[];
  logoutAction: () => Promise<void>;
};

export function AppSidebar({
  activeModuleKey,
  availableModuleKeys,
  logoutAction,
}: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex min-h-full w-full max-w-[18.75rem] flex-col gap-7 border-r border-white/10 bg-[linear-gradient(180deg,#12314a_0%,#0b2234_100%)] px-6 py-7 text-slate-50 lg:max-w-[19.75rem]">
      <div className="border-b border-white/12 pb-6">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-sky-100/80">
          Sistem Terpadu
        </p>
        <p className="mt-3 text-[2.35rem] font-semibold tracking-[0.14em] text-white">
          NCIS
        </p>
        <p className="mt-2 max-w-[13rem] text-sm leading-6 text-slate-300">
          Non Clinical Integrated System
        </p>
        <div className="mt-5">
          <ModuleSwitcher
            activeModuleKey={activeModuleKey}
            availableModuleKeys={availableModuleKeys}
            modules={NCIS_MODULES}
          />
        </div>
      </div>

      <SidebarNav pathname={pathname} />

      <div className="mt-auto pt-2">
        <LogoutButton
          logoutAction={logoutAction}
          className="w-full"
        />
      </div>
    </aside>
  );
}
