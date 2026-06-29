"use client";

import { usePathname } from "next/navigation";

import { SidebarNav } from "@/components/layout/sidebar-nav";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex min-h-full w-full max-w-[18rem] flex-col gap-6 border-r border-white/10 bg-[linear-gradient(180deg,#12314a_0%,#0b2234_100%)] px-5 py-6 text-slate-50 lg:max-w-[19rem]">
      <div className="border-b border-white/12 pb-5">
        <p className="text-[2.1rem] font-semibold tracking-[0.12em] text-white">
          NCIS
        </p>
        <p className="mt-2 max-w-[12rem] text-sm leading-6 text-slate-300">
          Non Clinical Integrated System
        </p>
        <span className="mt-4 inline-flex rounded-full border border-white/12 bg-white/8 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-sky-100">
          CSSD Module
        </span>
      </div>

      <SidebarNav pathname={pathname} />
    </aside>
  );
}
