import { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { OrderWizard } from "@/components/ambulance/order/order-wizard";

export const metadata: Metadata = {
  title: "Pesan Ambulans | NCIS",
  description: "Layanan pemesanan ambulans rumah sakit.",
};

const DEFAULT_HOSPITAL_COORDS: [number, number] = [-6.200000, 106.816666];

export default async function AmbulanceOrderPage() {
  const supabase = await createServerSupabaseClient();
  
  const { data: ambulances, error } = await supabase
    .from("ambulances")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (error) {
    console.error("Error fetching ambulances:", error);
    throw new Error("Gagal mengambil data ambulans.");
  }

  // Fetch active transactions where status = 'IN_USE'
  const { data: activeTransactions } = await supabase
    .from("ambulance_transactions")
    .select("id, ambulance_id")
    .eq("status", "IN_USE");

  const activeMap = new Map<string, string>();
  if (activeTransactions) {
    for (const tx of activeTransactions) {
      activeMap.set(tx.ambulance_id, tx.id);
    }
  }

  const ambulancesWithStatus = (ambulances || []).map((amb) => ({
    ...amb,
    is_in_use: activeMap.has(amb.id),
    active_transaction_id: activeMap.get(amb.id) || null,
  }));
  
  const { data: settings, error: settingsError } = await supabase
    .from("ambulance_settings")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (settingsError && settingsError.code !== 'PGRST116') {
    console.error("Error fetching ambulance settings:", settingsError);
  }
  
  // Default coordinates if not set: Jakarta
  const hospitalCoords: [number, number] = settings 
    ? [settings.hospital_lat, settings.hospital_lng]
    : DEFAULT_HOSPITAL_COORDS;

  return (
    <div className="w-full">
      <OrderWizard ambulances={ambulancesWithStatus} hospitalCoords={hospitalCoords} />
    </div>
  );
}
