import { serializeCsvTable } from "@/lib/csv";
import {
  buildReportCsvFilename,
  buildTransactionHistoryCsvTable,
} from "@/lib/cssd/reports/csv-export";
import {
  createSupabaseReportClient,
  listTransactionHistoryReport,
} from "@/lib/cssd/services/reports";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function getExportDate() {
  return new Date().toISOString().slice(0, 10);
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

  const table = buildTransactionHistoryCsvTable(rows);
  const filename = buildReportCsvFilename("transaction-history", {
    date: getExportDate(),
  });

  return new Response(serializeCsvTable(table), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
