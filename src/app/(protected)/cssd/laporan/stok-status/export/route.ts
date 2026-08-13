import { format } from "date-fns";
import { buildExcelBuffer } from "@/lib/excel";
import {
  buildReportExcelFilename,
  buildStockStatusExcelTable,
} from "@/lib/cssd/reports/excel-export";
import {
  createSupabaseReportClient,
  listCurrentStockReport,
} from "@/lib/cssd/services/reports";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function getExportDate() {
  return format(new Date(), 'yyyy-MM-dd');
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const itemId = url.searchParams.get("stockItem") ?? undefined;
  const rawUnitId = url.searchParams.get("stockUnit") ?? undefined;
  const unitId = rawUnitId === "INTERNAL" ? null : rawUnitId;

  const supabase = await createServerSupabaseClient();
  const reportClient = createSupabaseReportClient(supabase);
  const rows = await listCurrentStockReport(reportClient, {
    itemId,
    unitId,
    limit: 100,
  });

  const table = buildStockStatusExcelTable(rows, "LAPORAN STOK STATUS CSSD");
  const filename = buildReportExcelFilename("stock-status", {
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
