import type { ReactNode } from "react";

import { logoutAction } from "@/app/(protected)/actions";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { ModuleHeader } from "@/components/layout/module-header";
import { getAvailableModuleKeys } from "@/lib/auth/module-availability";
import { requireAmbulanceAccess } from "@/lib/auth/guards";

type AmbulanceLayoutProps = { children: ReactNode };

export default async function AmbulanceLayout({ children }: AmbulanceLayoutProps) {
  const profile = await requireAmbulanceAccess();
  const availableModuleKeys = getAvailableModuleKeys(profile?.role ?? null);

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-950 flex flex-col font-sans">
      <div className="flex min-h-screen w-full flex-1">
        <div className="hidden lg:flex lg:w-72 lg:shrink-0">
          <AppSidebar
            activeModuleKey="AMBULANCE"
            availableModuleKeys={availableModuleKeys}
            role={profile?.role ?? null}
            logoutAction={logoutAction}
          />
        </div>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col w-full">
          <ModuleHeader
            activeModuleKey="AMBULANCE"
            availableModuleKeys={availableModuleKeys}
            logoutAction={logoutAction}
          />
          <main className="flex-1 w-full px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
