import { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { OrderWizard } from "@/components/ambulance/order/order-wizard";

export const metadata: Metadata = {
  title: "Pesan Ambulans | NCIS",
  description: "Layanan pemesanan ambulans rumah sakit.",
};

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

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-5xl">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Pesan Ambulans</h1>
        <p className="text-muted-foreground">
          Layanan pemesanan ambulans. Pilih armada dan tentukan lokasi tujuan.
        </p>
      </div>
      
      <OrderWizard ambulances={ambulances || []} />
    </div>
  );
}
