import { serializeCsvTable } from "@/lib/csv";
import {
  buildReportCsvFilename,
  buildStockCardCsvTable,
} from "@/lib/cssd/reports/csv-export";
import {
  createSupabaseReportClient,
  listItemStockCardReport,
} from "@/lib/cssd/services/reports";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function getExportDate() {
  return new Date().toISOString().slice(0, 10);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const itemId = url.searchParams.get("cardItem") ?? undefined;
  const unitId = url.searchParams.get("cardUnit") ?? undefined;
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

  const table = buildStockCardCsvTable(rows);
  const filename = buildReportCsvFilename("stock-card", {
    date: getExportDate(),
    itemCode: rows[0]?.itemCode,
  });

  return new Response(serializeCsvTable(table), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
