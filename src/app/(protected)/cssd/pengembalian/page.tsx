import { ReturnTransactionView } from "@/components/cssd/transactions/return-transaction-view";
import {
  listActiveHospitalUnits,
  listActiveItems,
  listRecentTransactionHistory,
  listStockSummary,
} from "@/lib/cssd/services/transaction-read-models";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { deleteTransactionAction } from "@/app/(protected)/cssd/actions";

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
  ]);

  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.user_metadata?.role || user?.app_metadata?.role;
  const isAdmin = role === "ADMIN_CSSD" || role === "KEPALA_SEKSI";

  return (
    <ReturnTransactionView
      items={items}
      hospitalUnits={hospitalUnits}
      recentTransactions={recentTransactions}
      stockSummary={stockSummary}
      isAdmin={isAdmin}
      onDelete={deleteTransactionAction}
    />
  );
}
