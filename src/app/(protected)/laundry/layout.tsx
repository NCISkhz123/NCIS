import type { ReactNode } from "react";

import { logoutAction } from "@/app/(protected)/actions";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { ModuleHeader } from "@/components/layout/module-header";
import { requireLaundryAccess } from "@/lib/auth/guards";

type LaundryLayoutProps = {
  children: ReactNode;
};

function formatRoleLabel(role: string | null) {
  if (role === "ADMIN_LAUNDRY") {
    return "Admin Laundry";
  }

  if (role === "PETUGAS_LAUNDRY") {
    return "Petugas Laundry";
  }

  return "Laundry User";
}

export default async function LaundryLayout({ children }: LaundryLayoutProps) {
  const profile = await requireLaundryAccess();

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f2f6f9_0%,#eef4f8_45%,#fbfdff_100%)] text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-[112rem]">
        <div className="hidden lg:flex lg:w-[19rem] lg:shrink-0">
          <AppSidebar />
        </div>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <ModuleHeader
            roleLabel={formatRoleLabel(profile?.role ?? null)}
            email={profile?.email ?? null}
            logoutAction={logoutAction}
          />
          <main className="flex-1 px-4 py-5 md:px-6 lg:px-8 lg:py-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

