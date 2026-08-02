import { buildExcelBuffer } from "@/lib/excel";
import {
  buildReportExcelFilename,
  buildStockCardExcelTable,
} from "@/lib/laundry/reports/excel-export";
import {
  createSupabaseReportClient,
  listItemStockCardReport,
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
  const itemId = url.searchParams.get("cardItem") ?? undefined;
  const rawUnitId = url.searchParams.get("cardUnit") ?? undefined;
  const unitId = rawUnitId === "INTERNAL" ? null : rawUnitId;
  const dateFrom = url.searchParams.get("cardFrom") ?? undefined;
  const dateTo = url.searchParams.get("cardTo") ?? undefined;

  const supabase = await createServerSupabaseClient();
  const reportClient = createSupabaseReportClient(supabase);
  const rows = await listItemStockCardReport(reportClient, {
    itemId,
    unitId,
    dateFrom,
    dateTo,
    limit: 100,
  });

  const period = formatPeriod(dateFrom, dateTo);
  const table = buildStockCardExcelTable(rows, "LAPORAN KARTU STOK LAUNDRY", period);
  const filename = buildReportExcelFilename("stock-card", {
    date: getExportDate(),
    itemCode: rows[0]?.itemCode,
  });

  const buffer = await buildExcelBuffer(table);

  return new Response(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
