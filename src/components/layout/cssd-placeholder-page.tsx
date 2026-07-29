import Link from "next/link";

import { EmptyState } from "@/components/data/empty-state";
import { CSSD_NAV_ITEMS } from "@/lib/cssd/constants";
import { LAUNDRY_NAV_ITEMS } from "@/lib/laundry/constants";

type CssdPlaceholderPageProps = {
  eyebrow?: string;
  title: string;
  description: string;
  module: "cssd" | "laundry";
};

type QuickSection = {
  label: string;
  title: string;
  description: string;
  links: {
    label: string;
    href: string;
  }[];
};

function buildSections(module: "cssd" | "laundry"): QuickSection[] {
  const navItems = module === "laundry" ? LAUNDRY_NAV_ITEMS : CSSD_NAV_ITEMS;
  const moduleLabel = module === "laundry" ? "Laundry" : "CSSD";

  const masterDataGroup = navItems.find(
    (item) => item.type === "group" && item.label === "Master Data"
  );
  const reportGroup = navItems.find(
    (item) => item.type === "group" && item.label === "Laporan"
  );
  const transactionLinks = navItems.filter((item) => item.type === "link");

  return [
    {
      label: "Master data",
      title: "Siapkan data utama",
      description: `Lengkapi item, satuan, dan unit ${moduleLabel} sebelum transaksi dimulai.`,
      links:
        masterDataGroup?.type === "group"
          ? masterDataGroup.children
          : [],
    },
    {
      label: "Transaksi",
      title: "Catat pekerjaan harian",
      description: `Buka transaksi ${moduleLabel} sesuai alur kerja yang sedang berjalan.`,
      links: transactionLinks.map((item) => ({
        label: item.label,
        href: item.href,
      })),
    },
    {
      label: "Laporan",
      title: "Periksa hasil dan stok",
      description: "Lihat riwayat, posisi stok, dan pergerakan item.",
      links:
        reportGroup?.type === "group"
          ? reportGroup.children
          : [],
    },
  ];
}

export function CssdPlaceholderPage({
  eyebrow,
  title,
  description,
  module,
}: CssdPlaceholderPageProps) {
  const sections = buildSections(module);

  return (
    <div className="grid gap-7">
      <EmptyState eyebrow={eyebrow} title={title} description={description} />

      <section className="grid gap-5 xl:grid-cols-[1.12fr_.88fr]">
        <div className="grid gap-5">
          {sections.map((section) => (
            <article
              key={section.label}
              className="shell-surface rounded-[1.75rem] p-6 md:p-7"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-2xl">
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-slate-500">
                    {section.label}
                  </p>
                  <h2 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-slate-950">
                    {section.title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {section.description}
                  </p>
                </div>
                <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {section.links.length} menu
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                {section.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </article>
          ))}
        </div>

        <aside className="rounded-[1.75rem] border border-slate-200 bg-[linear-gradient(180deg,#153149_0%,#0e2536_100%)] p-6 text-slate-50 shadow-sm md:p-7">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-sky-100/80">
            Mulai kerja
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-balance">
            Urutkan pekerjaan tanpa bolak-balik menu
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-200">
            Gunakan halaman ini sebagai titik masuk cepat untuk data utama,
            transaksi harian, dan laporan.
          </p>

          <div className="mt-6 grid gap-3">
            {[
              "Lengkapi master data lebih dulu.",
              "Catat transaksi sesuai alur kerja.",
              "Periksa stok dan riwayat sebelum tutup shift.",
            ].map((step, index) => (
              <div
                key={step}
                className="rounded-[1.35rem] border border-white/10 bg-white/8 px-4 py-4"
              >
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-sky-100/75">
                  Langkah {index + 1}
                </p>
                <p className="mt-2 text-sm leading-6 text-white">{step}</p>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </div>
  );
}
