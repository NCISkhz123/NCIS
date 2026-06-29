import { DistributionTransactionView } from "@/components/cssd/transactions/distribution-transaction-view";
import {
  listActiveHospitalUnits,
  listActiveItems,
  listRecentTransactionHistory,
  listStockSummary,
} from "@/lib/cssd/services/transaction-read-models";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default function DistribusiPage() {
  return <DistribusiPageContent />;
}

async function DistribusiPageContent() {
  const supabase = await createServerSupabaseClient();
  const [items, hospitalUnits, recentTransactions, stockSummary] =
    await Promise.all([
      listActiveItems(supabase, {
        itemTypes: ["REUSABLE", "CONSUMABLE_DISTRIBUTION"],
      }),
      listActiveHospitalUnits(supabase),
      listRecentTransactionHistory(supabase, {
        movementType: "DISTRIBUTION",
        itemTypes: ["REUSABLE", "CONSUMABLE_DISTRIBUTION"],
        limit: 8,
      }),
      listStockSummary(supabase, {
        itemTypes: ["REUSABLE", "CONSUMABLE_DISTRIBUTION"],
        positions: ["READY"],
        limit: 12,
      }),
    ]);

  return (
    <DistributionTransactionView
      items={items}
      hospitalUnits={hospitalUnits}
      recentTransactions={recentTransactions}
      stockSummary={stockSummary}
    />
  );
}
