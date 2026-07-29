import { serializeCsvTable } from "@/lib/csv";
import {
  buildReportCsvFilename,
  buildStockStatusCsvTable,
} from "@/lib/laundry/reports/csv-export";
import {
  createSupabaseReportClient,
  listCurrentStockReport,
} from "@/lib/laundry/services/reports";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function getExportDate() {
  return new Date().toISOString().slice(0, 10);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const itemId = url.searchParams.get("stockItem") ?? undefined;
  const unitId = url.searchParams.get("stockUnit") ?? undefined;

  const supabase = await createServerSupabaseClient();
  const reportClient = createSupabaseReportClient(supabase);
  const rows = await listCurrentStockReport(reportClient, {
    itemId,
    unitId,
  });

  const table = buildStockStatusCsvTable(rows);
  const filename = buildReportCsvFilename("stock-status", {
    date: getExportDate(),
  });

  return new Response(serializeCsvTable(table), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

