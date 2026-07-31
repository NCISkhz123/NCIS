'use server';

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createAmbulanceOrder(data: {
  ambulance_id: string;
  destination_lat: number;
  destination_lng: number;
  distance_km: number;
  total_cost: number;
}) {
  const supabase = await createServerSupabaseClient();
  
  const { error } = await supabase.from('ambulance_transactions').insert({
    ambulance_id: data.ambulance_id,
    destination_lat: data.destination_lat,
    destination_lng: data.destination_lng,
    distance_km: data.distance_km,
    total_cost: data.total_cost,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/ambulance/history');
  return { success: true };
}
