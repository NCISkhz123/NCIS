import { InternalUsageTransactionView } from "@/components/laundry/transactions/internal-usage-transaction-view";
import {
  listActiveItems,
  listRecentTransactionHistory,
  listStockSummary,
} from "@/lib/laundry/services/transaction-read-models";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { deleteLaundryTransactionAction } from "@/app/(protected)/laundry/actions";

export default function PemakaianInternalPage() {
  return <PemakaianInternalPageContent />;
}

async function PemakaianInternalPageContent() {
  const supabase = await createServerSupabaseClient();
  const [items, recentTransactions, stockSummary] = await Promise.all([
    listActiveItems(supabase, {
      itemTypes: ["CONSUMABLE"],
    }),
    listRecentTransactionHistory(supabase, {
      movementType: "INTERNAL_USAGE",
      itemTypes: ["CONSUMABLE"],
      limit: 8,
    }),
    listStockSummary(supabase, {
      itemTypes: ["CONSUMABLE"],
      positions: ["READY"],
      limit: 12,
    }),
  ]);

  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.user_metadata?.role || user?.app_metadata?.role;
  const isAdmin = role === "ADMIN_LAUNDRY" || role === "KEPALA_SEKSI";

  return (
    <InternalUsageTransactionView
      items={items}
      recentTransactions={recentTransactions}
      stockSummary={stockSummary}
      isAdmin={isAdmin}
      onDelete={deleteLaundryTransactionAction}
    />
  );
}


