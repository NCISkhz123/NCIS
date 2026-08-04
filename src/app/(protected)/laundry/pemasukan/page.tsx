import { ReceiptTransactionView } from "@/components/laundry/transactions/receipt-transaction-view";
import {
  listActiveItems,
  listRecentTransactionHistory,
  listStockSummary,
} from "@/lib/laundry/services/transaction-read-models";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isLaundryRole } from "@/lib/auth/roles";
import { deleteLaundryTransactionAction } from "@/app/(protected)/laundry/actions";

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
  const isAdmin = role === "ADMIN_LAUNDRY" || role === "KEPALA_SEKSI";

  return (
    <ReceiptTransactionView
      items={items}
      recentTransactions={recentTransactions}
      stockSummary={stockSummary}
      isAdmin={isAdmin}
      onDelete={deleteLaundryTransactionAction}
    />
  );
}

