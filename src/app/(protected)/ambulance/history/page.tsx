import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AmbulanceHistoryView, type AmbulanceTransactionHistory } from "@/components/ambulance/history/ambulance-history-view";
import { deleteAmbulanceTransactionAction } from "@/app/(protected)/ambulance/actions";

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

  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.user_metadata?.role || user?.app_metadata?.role;
  const isAdmin = role === "ADMIN_AMBULANCE" || role === "KEPALA_SEKSI";

  return (
    <div className="w-full">
      <AmbulanceHistoryView 
        transactions={transactions as unknown as AmbulanceTransactionHistory[]} 
        isAdmin={isAdmin}
        onDelete={deleteAmbulanceTransactionAction}
      />
    </div>
  );
}
