import { ReturnTransactionView } from "@/components/laundry/transactions/return-transaction-view";
import {
  listActiveHospitalUnits,
  listActiveItems,
  listRecentTransactionHistory,
  listReusableProcessingSummary,
  listStockSummary,
} from "@/lib/laundry/services/transaction-read-models";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { deleteLaundryTransactionAction } from "@/app/(protected)/laundry/actions";

export default function PengembalianPage() {
  return <PengembalianPageContent />;
}

async function PengembalianPageContent() {
  const supabase = await createServerSupabaseClient();
  const [
    items,
    hospitalUnits,
    recentTransactions,
    stockSummary,
    reusableProcessingSummary,
  ] = await Promise.all([
    listActiveItems(supabase, {
      itemTypes: ["REUSABLE"],
    }),
    listActiveHospitalUnits(supabase),
    listRecentTransactionHistory(supabase, {
      movementType: "RETURN",
      itemTypes: ["REUSABLE"],
      limit: 8,
    }),
    listStockSummary(supabase, {
      itemTypes: ["REUSABLE"],
      positions: ["IN_UNIT", "NON_STERILE", "STERILIZATION_AREA", "DAMAGED"],
      limit: 16,
    }),
    listReusableProcessingSummary(supabase),
  ]);

  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.user_metadata?.role || user?.app_metadata?.role;
  const isAdmin = role === "ADMIN_LAUNDRY" || role === "KEPALA_SEKSI";

  return (
    <ReturnTransactionView
      items={items}
      hospitalUnits={hospitalUnits}
      recentTransactions={recentTransactions}
      stockSummary={stockSummary}
      reusableProcessingSummary={reusableProcessingSummary}
      isAdmin={isAdmin}
      onDelete={deleteLaundryTransactionAction}
    />
  );
}


