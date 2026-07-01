import { ReceiptTransactionView } from "@/components/laundry/transactions/receipt-transaction-view";
import {
  listActiveItems,
  listRecentTransactionHistory,
  listStockSummary,
} from "@/lib/laundry/services/transaction-read-models";
import { createServerSupabaseClient } from "@/lib/supabase/server";

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

  return (
    <ReceiptTransactionView
      items={items}
      recentTransactions={recentTransactions}
      stockSummary={stockSummary}
    />
  );
}

