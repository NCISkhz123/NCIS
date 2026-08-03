import { DistributionTransactionView } from "@/components/laundry/transactions/distribution-transaction-view";
import {
  listActiveHospitalUnits,
  listActiveItems,
  listRecentTransactionHistory,
  listStockSummary,
} from "@/lib/laundry/services/transaction-read-models";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { deleteLaundryTransactionAction } from "@/app/(protected)/laundry/actions";

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
  const isAdmin = role === "ADMIN_LAUNDRY" || role === "KEPALA_SEKSI";

  return (
    <DistributionTransactionView
      items={items}
      hospitalUnits={hospitalUnits}
      recentTransactions={recentTransactions}
      stockSummary={stockSummary}
      isAdmin={isAdmin}
      onDelete={deleteLaundryTransactionAction}
    />
  );
}


