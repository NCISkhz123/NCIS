import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AmbulanceTrackingView, type ActiveTransactionDetail } from "@/components/ambulance/tracking/ambulance-tracking-view";

export const metadata: Metadata = {
  title: "Telemetri Disposisi Ambulans | NCIS",
  description: "Pemantauan real-time status penugasan ambulans rumah sakit.",
};

const DEFAULT_HOSPITAL_COORDS: [number, number] = [-6.200000, 106.816666];

export default async function AmbulanceTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: transaction, error } = await supabase
    .from("ambulance_transactions")
    .select(`
      *,
      ambulances (
        name,
        plate_number,
        base_price_per_km,
        image_url
      )
    `)
    .eq("id", id)
    .single();

  if (error || !transaction) {
    notFound();
  }

  const { data: settings } = await supabase
    .from("ambulance_settings")
    .select("*")
    .limit(1)
    .maybeSingle();

  const hospitalCoords: [number, number] = settings 
    ? [settings.hospital_lat, settings.hospital_lng]
    : DEFAULT_HOSPITAL_COORDS;

  return (
    <div className="w-full">
      <AmbulanceTrackingView 
        transaction={transaction as unknown as ActiveTransactionDetail} 
        hospitalCoords={hospitalCoords} 
      />
    </div>
  );
}
