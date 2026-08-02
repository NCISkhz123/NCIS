import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { EmptyState } from "@/components/data/empty-state";
import { CSSD_NAV_ITEMS } from "@/lib/cssd/constants";
import { LAUNDRY_NAV_ITEMS } from "@/lib/laundry/constants";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

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
      label: "Master Data",
      title: "Siapkan Data Utama",
      description: `Lengkapi katalog item, satuan (UOM), dan unit ${moduleLabel} sebelum transaksi.`,
      links:
        masterDataGroup?.type === "group"
          ? masterDataGroup.children
          : [],
    },
    {
      label: "Transaksi Operasional",
      title: "Catat Pekerjaan Harian",
      description: `Buka transaksi ${moduleLabel} untuk penerimaan, pengiriman, atau pergerakan barang.`,
      links: transactionLinks.map((item) => ({
        label: item.label,
        href: item.href,
      })),
    },
    {
      label: "Laporan & Monitoring",
      title: "Periksa Hasil & Saldo Stok",
      description: "Tinjau riwayat transaksi, laporan pergerakan, dan saldo fisik.",
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
    <div className="grid gap-6">
      <EmptyState eyebrow={eyebrow} title={title} description={description} />

      <section className="grid gap-6 xl:grid-cols-12 items-start">
        <div className="xl:col-span-7 grid gap-4">
          {sections.map((section) => (
            <Card key={section.label}>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <Badge variant="info">{section.label}</Badge>
                    <CardTitle className="mt-2 text-base font-bold text-slate-900">
                      {section.title}
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-600 font-medium">
                      {section.description}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">
                    {section.links.length} Akses
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 pt-1">
                  {section.links.map((link) => (
                    <Link 
                      key={link.href} 
                      href={link.href}
                      className={buttonVariants({ variant: "outline", size: "sm" })}
                    >
                      <span>{link.label}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="xl:col-span-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-sm">
            <Badge variant="success" dot>
              ALUR KERJA OPERASIONAL
            </Badge>
            <h2 className="mt-3 text-xl font-bold tracking-tight text-slate-900">
              Navigasi Cepat Pekerjaan Shift
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-700 font-medium">
              Titik masuk terpadu untuk memastikan seluruh siklus sterilisasi & logistik tercatat tanpa hambatan.
            </p>

            <div className="mt-5 grid gap-3">
              {[
                { title: "Katalog Master Data", desc: "Pastikan item & unit terdaftar." },
                { title: "Input Transaksi Harian", desc: "Catat penerimaan, distribusi, & reuse." },
                { title: "Audit & Laporan Stok", desc: "Verifikasi saldo stok sebelum tutup shift." },
              ].map((step, index) => (
                <div
                  key={step.title}
                  className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5 transition-all hover:bg-slate-100"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-600 text-xs font-bold text-white">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{step.title}</p>
                    <p className="mt-0.5 text-xs text-slate-600 font-medium">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
