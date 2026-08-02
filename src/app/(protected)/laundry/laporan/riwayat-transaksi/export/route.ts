import { buildExcelBuffer } from "@/lib/excel";
import {
  buildReportExcelFilename,
  buildTransactionHistoryExcelTable,
} from "@/lib/laundry/reports/excel-export";
import {
  createSupabaseReportClient,
  listTransactionHistoryReport,
} from "@/lib/laundry/services/reports";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function getExportDate() {
  return new Date().toISOString().slice(0, 10);
}

function formatPeriod(dateFrom?: string, dateTo?: string) {
  if (dateFrom && dateTo) return `${dateFrom} s/d ${dateTo}`;
  if (dateFrom) return `Sejak ${dateFrom}`;
  if (dateTo) return `Hingga ${dateTo}`;
  return "Semua Waktu";
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const itemId = url.searchParams.get("historyItem") ?? undefined;
  const rawUnitId = url.searchParams.get("historyUnit") ?? undefined;
  const unitId = rawUnitId === "INTERNAL" ? null : rawUnitId;
  const historyType = url.searchParams.get("historyType") ?? undefined;
  const dateFrom = url.searchParams.get("historyFrom") ?? undefined;
  const dateTo = url.searchParams.get("historyTo") ?? undefined;

  const supabase = await createServerSupabaseClient();
  const reportClient = createSupabaseReportClient(supabase);
  const rows = await listTransactionHistoryReport(reportClient, {
    itemId,
    unitId,
    movementType: historyType,
    dateFrom,
    dateTo,
    limit: 100,
  });

  const period = formatPeriod(dateFrom, dateTo);
  const table = buildTransactionHistoryExcelTable(rows, "LAPORAN RIWAYAT TRANSAKSI LAUNDRY", period);
  const filename = buildReportExcelFilename("transaction-history", {
    date: getExportDate(),
  });

  const buffer = await buildExcelBuffer(table);

  return new Response(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
