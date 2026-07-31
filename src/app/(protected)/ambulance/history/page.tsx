import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AmbulanceHistoryView } from "@/components/ambulance/history/ambulance-history-view";

export default async function AmbulanceHistoryPage() {
  const supabase = await createServerSupabaseClient();
  
  const { data: transactions, error } = await supabase
    .from("ambulance_transactions")
    .select(`
      *,
      ambulances (
        name,
        plate_number
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load transactions: ${error.message}`);
  }

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-8">
      <AmbulanceHistoryView transactions={transactions as any} />
    </div>
  );
}
