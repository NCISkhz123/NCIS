import { Activity } from "lucide-react";

import { LogoutButton } from "@/components/layout/logout-button";
import { ModuleSwitcher } from "@/components/layout/module-switcher";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { NCIS_MODULES } from "@/lib/cssd/constants";
import type { CurrentProfile } from "@/lib/auth/profile";
import type { AppRole } from "@/lib/auth/roles";
import type { ModuleKey } from "@/lib/modules";

type AppSidebarProps = {
  activeModuleKey: ModuleKey;
  availableModuleKeys: readonly ModuleKey[];
  pathname?: string;
  profile?: CurrentProfile | null;
  role?: AppRole | null;
  logoutAction: () => Promise<void>;
};

const roleLabels = {
  ADMIN_CSSD: "Admin CSSD",
  PETUGAS_CSSD: "Petugas CSSD",
  ADMIN_LAUNDRY: "Admin Laundry",
  PETUGAS_LAUNDRY: "Petugas Laundry",
} as const;

export function AppSidebar({
  activeModuleKey,
  availableModuleKeys,
  pathname = "",
  profile,
  role,
  logoutAction,
}: AppSidebarProps) {
  const currentRole = profile?.role ?? role ?? null;
  const currentName = profile?.fullName ?? "Pengguna NCIS";
  const currentEmail = profile?.email ?? "user@ncis.local";

  return (
    <aside className="sticky top-0 flex h-screen w-72 flex-col justify-between border-r border-slate-800 bg-slate-900 p-5 text-white shadow-xl">
      <div className="space-y-6 overflow-y-auto">
        {/* Brand & Module Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-1">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-600 text-white shadow-md">
              <Activity className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-white text-base">
                  NCIS HEALTH
                </span>
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Integrated Hospital OS
              </p>
            </div>
          </div>

          <ModuleSwitcher
            activeModuleKey={activeModuleKey}
            availableModuleKeys={availableModuleKeys}
            modules={NCIS_MODULES}
          />
        </div>

        {/* Sidebar Navigation Links */}
        <SidebarNav pathname={pathname} role={currentRole ?? undefined} />
      </div>

      {/* User Profile & Logout Bottom Card */}
      <div className="pt-4 border-t border-slate-800 space-y-3">
        <div className="rounded-xl border border-slate-800 bg-slate-800/80 p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-white truncate">
              {currentName}
            </p>
            <span className="rounded-md bg-sky-500/20 px-2 py-0.5 text-[0.7rem] font-bold text-sky-300 border border-sky-500/30">
              {currentRole && currentRole in roleLabels
                ? roleLabels[currentRole as keyof typeof roleLabels]
                : currentRole ?? "PETUGAS"}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400 truncate font-mono">
            {currentEmail}
          </p>
        </div>

        <LogoutButton logoutAction={logoutAction} />
      </div>
    </aside>
  );
}
