import { InternalUsageTransactionView } from "@/components/cssd/transactions/internal-usage-transaction-view";
import {
  listActiveItems,
  listRecentTransactionHistory,
  listStockSummary,
} from "@/lib/cssd/services/transaction-read-models";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default function PemakaianInternalPage() {
  return <PemakaianInternalPageContent />;
}

async function PemakaianInternalPageContent() {
  const supabase = await createServerSupabaseClient();
  const [items, recentTransactions, stockSummary] = await Promise.all([
    listActiveItems(supabase, {
      itemTypes: ["CONSUMABLE_INTERNAL"],
    }),
    listRecentTransactionHistory(supabase, {
      movementType: "INTERNAL_USAGE",
      itemTypes: ["CONSUMABLE_INTERNAL"],
      limit: 8,
    }),
    listStockSummary(supabase, {
      itemTypes: ["CONSUMABLE_INTERNAL"],
      positions: ["READY"],
      limit: 12,
    }),
  ]);

  return (
    <InternalUsageTransactionView
      items={items}
      recentTransactions={recentTransactions}
      stockSummary={stockSummary}
    />
  );
}
