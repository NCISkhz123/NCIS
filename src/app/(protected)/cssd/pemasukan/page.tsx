import { ReceiptTransactionView } from "@/components/cssd/transactions/receipt-transaction-view";
import {
  listActiveItems,
  listRecentTransactionHistory,
  listStockSummary,
} from "@/lib/cssd/services/transaction-read-models";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { deleteCssdTransactionAction } from "@/app/(protected)/cssd/actions";

export default function PemasukanPage() {
  return <PemasukanPageContent />;
}

async function PemasukanPageContent() {
  const supabase = await createServerSupabaseClient();
  const [items, recentTransactions, stockSummary] = await Promise.all([
    listActiveItems(supabase),
    listRecentTransactionHistory(supabase, {
      movementType: "RECEIPT",
      limit: 8,
    }),
    listStockSummary(supabase, {
      positions: ["READY"],
      limit: 12,
    }),
  ]);

  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.user_metadata?.role || user?.app_metadata?.role;
  const isAdmin = role === "ADMIN_CSSD" || role === "KEPALA_SEKSI";

  return (
    <ReceiptTransactionView
      items={items}
      recentTransactions={recentTransactions}
      stockSummary={stockSummary}
      isAdmin={isAdmin}
      onDelete={deleteCssdTransactionAction}
    />
  );
}
