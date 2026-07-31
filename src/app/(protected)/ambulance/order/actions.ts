'use server';

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createAmbulanceOrder(data: {
  ambulance_id: string;
  destination_lat: number;
  destination_lng: number;
  distance_km: number;
}) {
  const supabase = await createServerSupabaseClient();
  
  // Fetch ambulance base_price_per_km
  const { data: ambulance, error: ambulanceError } = await supabase
    .from('ambulances')
    .select('base_price_per_km')
    .eq('id', data.ambulance_id)
    .single();

  if (ambulanceError || !ambulance) {
    return { error: "Ambulans tidak ditemukan" };
  }

  // Calculate total_cost server-side
  const total_cost = data.distance_km * ambulance.base_price_per_km;

  const { error } = await supabase.from('ambulance_transactions').insert({
    ambulance_id: data.ambulance_id,
    destination_lat: data.destination_lat,
    destination_lng: data.destination_lng,
    distance_km: data.distance_km,
    total_cost: total_cost,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/ambulance/history');
  return { success: true };
}
