'use server';

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createAmbulanceOrder(data: {
  ambulance_id: string;
  destination_lat: number;
  destination_lng: number;
  distance_km: number;
}) {
  if (data.distance_km <= 0 || data.distance_km > 2000) {
    return { error: 'Jarak tempuh tidak valid.' };
  }

  const supabase = await createServerSupabaseClient();
  
  // Check if ambulance is already in use
  const { data: activeOrder } = await supabase
    .from('ambulance_transactions')
    .select('id')
    .eq('ambulance_id', data.ambulance_id)
    .eq('status', 'IN_USE')
    .maybeSingle();

  if (activeOrder) {
    return { error: "Ambulans ini sedang bertugas dan belum menyelesaikan pesanan." };
  }

  // Fetch ambulance base_price_per_km
  const { data: ambulance, error: ambulanceError } = await supabase
    .from('ambulances')
    .select('base_price_per_km')
    .eq('id', data.ambulance_id)
    .single();

  if (ambulanceError || !ambulance) {
    return { error: "Ambulans tidak ditemukan" };
  }

  // Calculate total_cost server-side with round trip (Pulang-Pergi / 2x distance)
  const total_cost = data.distance_km * ambulance.base_price_per_km * 2;

  const { data: transaction, error } = await supabase
    .from('ambulance_transactions')
    .insert({
      ambulance_id: data.ambulance_id,
      destination_lat: data.destination_lat,
      destination_lng: data.destination_lng,
      distance_km: data.distance_km,
      total_cost: total_cost,
      status: 'IN_USE',
    })
    .select('id')
    .single();

  if (error || !transaction) {
    return { error: error?.message || "Gagal membuat transaksi" };
  }

  revalidatePath('/ambulance/history');
  revalidatePath('/ambulance/order');
  return { success: true, id: transaction.id };
}

export async function completeAmbulanceOrder(transactionId: string) {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from('ambulance_transactions')
    .update({
      status: 'COMPLETED',
      completed_at: new Date().toISOString(),
    })
    .eq('id', transactionId)
    .eq('status', 'IN_USE');

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/ambulance/history');
  revalidatePath('/ambulance/order');
  revalidatePath(`/ambulance/tracking/${transactionId}`);
  return { success: true };
}
