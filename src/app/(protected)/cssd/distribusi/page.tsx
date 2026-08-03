import { DistributionTransactionView } from "@/components/cssd/transactions/distribution-transaction-view";
import {
  listActiveHospitalUnits,
  listActiveItems,
  listRecentTransactionHistory,
  listStockSummary,
} from "@/lib/cssd/services/transaction-read-models";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { deleteCssdTransactionAction } from "@/app/(protected)/cssd/actions";

export default function DistribusiPage() {
  return <DistribusiPageContent />;
}

async function DistribusiPageContent() {
  const supabase = await createServerSupabaseClient();
  const [items, hospitalUnits, recentTransactions, stockSummary] =
    await Promise.all([
      listActiveItems(supabase, {
        itemTypes: ["REUSABLE", "CONSUMABLE"],
      }),
      listActiveHospitalUnits(supabase),
      listRecentTransactionHistory(supabase, {
        movementType: "DISTRIBUTION",
        itemTypes: ["REUSABLE", "CONSUMABLE"],
        limit: 8,
      }),
      listStockSummary(supabase, {
        itemTypes: ["REUSABLE", "CONSUMABLE"],
        positions: ["READY"],
        limit: 12,
      }),
    ]);

  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.user_metadata?.role || user?.app_metadata?.role;
  const isAdmin = role === "ADMIN_CSSD" || role === "KEPALA_SEKSI";

  return (
    <DistributionTransactionView
      items={items}
      hospitalUnits={hospitalUnits}
      recentTransactions={recentTransactions}
      stockSummary={stockSummary}
      isAdmin={isAdmin}
      onDelete={deleteCssdTransactionAction}
    />
  );
}

