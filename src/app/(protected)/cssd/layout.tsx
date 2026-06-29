import type { ReactNode } from "react";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { ModuleHeader } from "@/components/layout/module-header";
import { requireCssdAccess } from "@/lib/auth/guards";

type CssdLayoutProps = {
  children: ReactNode;
};

function formatRoleLabel(role: string | null) {
  if (role === "ADMIN_CSSD") {
    return "Admin CSSD";
  }

  if (role === "PETUGAS_CSSD") {
    return "Petugas CSSD";
  }

  return "CSSD User";
}

export default async function CssdLayout({ children }: CssdLayoutProps) {
  const profile = await requireCssdAccess();

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
          />
          <main className="flex-1 px-4 py-5 md:px-6 lg:px-8 lg:py-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
