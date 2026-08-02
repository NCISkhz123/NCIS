import { Activity } from "lucide-react";
import Image from "next/image";

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
          <div className="flex items-center gap-4 px-1">
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white shadow-lg p-1.5 overflow-hidden">
              <Image 
                src="/logo.png"
                alt="Logo RSUD KHZ. Musthafa"
                width={48}
                height={48}
                className="object-contain"
                priority
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-white text-xl">
                  NCIS
                </span>
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-sm text-slate-300 font-semibold mt-0.5">
                RSUD KHZ. MUSTHAFA
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
        <LogoutButton logoutAction={logoutAction} />
      </div>
    </aside>
  );
}
