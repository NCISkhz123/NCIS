import { StockOpnameView } from "@/components/laundry/transactions/stock-opname-view";
import { getCurrentProfile } from "@/lib/auth/profile";
import { listStockSummary } from "@/lib/laundry/services/transaction-read-models";
import {
  getDraftStockOpnameSession,
  listAvailableStockOpnameItems,
  listAvailableStockOpnameUnits,
  listRecentStockOpnameSessions,
  listStockOpnameLines,
} from "@/lib/laundry/services/stock-opname";
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
    ? await listStockOpnameLines(supabase, draftSession.id, draftSession.status)
    : [];

  const profile = await getCurrentProfile();
  const isChecker = profile?.role === "ADMIN_LAUNDRY" || profile?.role === "KEPALA_SEKSI";

  return (
    <StockOpnameView
      items={items}
      hospitalUnits={hospitalUnits}
      draftSession={draftSession}
      draftLines={draftLines}
      recentSessions={recentSessions}
      stockSummary={stockSummary}
      isChecker={isChecker}
    />
  );
}

