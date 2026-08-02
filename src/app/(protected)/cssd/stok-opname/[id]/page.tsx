import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { DataTable } from "@/components/data/data-table";
import { TransactionPageShell } from "@/components/transactions/transaction-page-shell";
import { ITEM_TYPE_LABELS } from "@/lib/cssd/constants";
import { listStockOpnameLines } from "@/lib/cssd/services/stock-opname";
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

export default async function StokOpnameDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const sessionId = params.id;
  const supabase = await createServerSupabaseClient();

  const { data: session, error } = await supabase
    .from("stock_opname_sessions")
    .select("id, opname_date, status, notes, scope_type, hospital_units(name)")
    .eq("id", sessionId)
    .single();

  if (error || !session) {
    notFound();
  }

  const lines = await listStockOpnameLines(supabase, sessionId, session.status as any);

  let scopeLabel = "Seluruh Unit (Global)";
  if (session.scope_type === "INTERNAL") {
    scopeLabel = "Depo Utama CSSD";
  } else if (session.scope_type === "UNIT") {
    const unit = Array.isArray(session.hospital_units) 
      ? session.hospital_units[0] 
      : session.hospital_units;
    if (unit) {
      scopeLabel = `Unit ${(unit as any).name}`;
    }
  }

  return (
    <TransactionPageShell
      eyebrow="CSSD"
      title="Detail Stok Opname"
      description={`Sesi stok opname tanggal ${formatDateLabel(session.opname_date)}.`}
      formTitle="Informasi Sesi"
      formDescription="Rincian dari sesi stok opname ini."
      form={
        <div className="grid gap-4">
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
              href="/cssd/stok-opname"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Stok Opname
            </Link>
          </div>
        </div>
      }
      supportingContent={
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
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
        </div>
      }
    />
  );
}
