import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { DataTable } from "@/components/data/data-table";
import { ITEM_TYPE_LABELS } from "@/lib/laundry/constants";
import { listStockOpnameLines } from "@/lib/laundry/services/stock-opname";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function formatDateLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function LaundryStokOpnameDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const sessionId = params.id;
  const supabase = await createServerSupabaseClient();

  const { data: session, error } = await supabase
    .from("laundry_stock_opname_sessions")
    .select("id, opname_date, status, notes, scope_type, laundry_hospital_units(name)")
    .eq("id", sessionId)
    .single();

  if (error || !session) {
    notFound();
  }

  const lines = await listStockOpnameLines(supabase, sessionId, session.status as any);

  let scopeLabel = "Seluruh Unit (Global)";
  if (session.scope_type === "INTERNAL") {
    scopeLabel = "Depo Utama Laundry";
  } else if (session.scope_type === "UNIT") {
    const unit = Array.isArray(session.laundry_hospital_units) 
      ? session.laundry_hospital_units[0] 
      : session.laundry_hospital_units;
    if (unit) {
      scopeLabel = `Unit ${(unit as any).name}`;
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-6 2xl:grid-cols-[1.08fr_.92fr]">
        <div className="grid gap-6 h-full flex flex-col">
          <section className="shell-surface rounded-[1.75rem] p-6 md:p-7 flex-1 flex flex-col min-h-[400px]">
            <div className="space-y-6 flex-1 flex flex-col">
              <p className="mb-3 text-sm font-semibold text-slate-800">
                Laundry • Detail Stok Opname
              </p>
              
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Sesi {formatDateLabel(session.opname_date)}
              </h1>
              
              <div className="grid gap-4 mt-6">
                <div>
                  <p className="text-sm font-semibold text-slate-500">Status</p>
                  <p className="text-base font-bold text-slate-900">{session.status}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500">Cakupan</p>
                  <p className="text-base font-bold text-slate-900">{scopeLabel}</p>
                </div>
                {session.notes && (
                  <div>
                    <p className="text-sm font-semibold text-slate-500">Catatan</p>
                    <p className="text-base text-slate-900">{session.notes}</p>
                  </div>
                )}
                <div className="pt-4">
                  <Link 
                    href="/laundry/stok-opname"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Kembali ke Stok Opname
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="grid gap-6">
          <section className="shell-surface rounded-[1.75rem] p-6">
            <h3 className="mb-4 text-base font-bold text-slate-900">
              Hasil Hitung ({lines.length} baris)
            </h3>
            <DataTable
              caption="Detail Baris"
              columns={["Item", "Jenis", "Posisi", "Unit", "Qty Hitung", "Qty Sistem", "Catatan"]}
              rows={
                lines.length > 0
                  ? lines.map((line) => [
                      `${line.itemCode} - ${line.itemName}`,
                      ITEM_TYPE_LABELS[line.itemType],
                      line.stockPositionLabel,
                      line.hospitalUnitName ?? "-",
                      line.countedQuantity,
                      line.currentQuantity,
                      line.notes ?? "-",
                    ])
                  : [["-", "-", "-", "-", "-", "-", "-"]]
              }
            />
          </section>
        </div>
      </div>
    </div>
  );
}
