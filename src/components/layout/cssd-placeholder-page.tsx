import { DataTable } from "@/components/data/data-table";
import { EmptyState } from "@/components/data/empty-state";

type CssdPlaceholderPageProps = {
  eyebrow?: string;
  title: string;
  description: string;
};

export function CssdPlaceholderPage({
  eyebrow,
  title,
  description,
}: CssdPlaceholderPageProps) {
  return (
    <div className="grid gap-6">
      <EmptyState eyebrow={eyebrow} title={title} description={description} />

      <section className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
        <DataTable
          caption="Pratinjau struktur kerja halaman"
          columns={["Area", "Tujuan"]}
          rows={[
            ["Header", "Judul route aktif dan konteks modul"],
            ["Area utama", "Tabel data atau histori transaksi"],
            ["Form", "Input cepat untuk operasi harian"],
          ]}
        />

        <div className="rounded-[1.5rem] border border-slate-200 bg-[linear-gradient(180deg,#153149_0%,#0e2536_100%)] p-6 text-slate-50 shadow-sm">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-sky-100/80">
            Langkah Berikutnya
          </p>
          <h2 className="mt-3 text-xl font-semibold tracking-[-0.03em]">
            Konten operasional akan diisi pada task berikutnya
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-200">
            Shell, navigasi, dan pola visual sudah aktif. Halaman ini sekarang
            aman dibuka sambil menunggu form, server action, dan tabel final
            diimplementasikan pada task modul terkait.
          </p>
        </div>
      </section>
    </div>
  );
}
