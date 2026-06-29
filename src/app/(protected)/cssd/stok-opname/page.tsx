import { StockOpnameView } from "@/components/cssd/transactions/stock-opname-view";
import { listStockSummary } from "@/lib/cssd/services/transaction-read-models";
import {
  getDraftStockOpnameSession,
  listAvailableStockOpnameItems,
  listAvailableStockOpnameUnits,
  listRecentStockOpnameSessions,
  listStockOpnameLines,
} from "@/lib/cssd/services/stock-opname";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default function StokOpnamePage() {
  return <StokOpnamePageContent />;
}

async function StokOpnamePageContent() {
  const supabase = await createServerSupabaseClient();
  const [items, hospitalUnits, draftSession, recentSessions, stockSummary] =
    await Promise.all([
      listAvailableStockOpnameItems(supabase),
      listAvailableStockOpnameUnits(supabase),
      getDraftStockOpnameSession(supabase),
      listRecentStockOpnameSessions(supabase),
      listStockSummary(supabase, {
        limit: 16,
      }),
    ]);

  const draftLines = draftSession
    ? await listStockOpnameLines(supabase, draftSession.id)
    : [];

  return (
    <StockOpnameView
      items={items}
      hospitalUnits={hospitalUnits}
      draftSession={draftSession}
      draftLines={draftLines}
      recentSessions={recentSessions}
      stockSummary={stockSummary}
    />
  );
}
