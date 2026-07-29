import type { ReactNode } from "react";

import { logoutAction } from "@/app/(protected)/actions";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { ModuleHeader } from "@/components/layout/module-header";
import { getAvailableModuleKeys } from "@/lib/auth/module-availability";
import { requireLaundryAccess } from "@/lib/auth/guards";

type LaundryLayoutProps = { children: ReactNode };

export default async function LaundryLayout({ children }: LaundryLayoutProps) {
  const profile = await requireLaundryAccess();
  const availableModuleKeys = getAvailableModuleKeys(profile?.role ?? null);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="flex min-h-screen w-full">
        <div className="hidden lg:flex lg:w-72 lg:shrink-0">
          <AppSidebar
            activeModuleKey="LAUNDRY"
            availableModuleKeys={availableModuleKeys}
            role={profile?.role ?? null}
            logoutAction={logoutAction}
          />
        </div>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <ModuleHeader
            activeModuleKey="LAUNDRY"
            availableModuleKeys={availableModuleKeys}
            logoutAction={logoutAction}
          />
          <main className="flex-1 px-6 py-6 md:px-8 md:py-8 xl:px-10">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
