"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveAmbulanceSettings(data: { id?: string, hospital_lat: number, hospital_lng: number }) {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("ambulance_settings").upsert(data);
  if (error) throw new Error(error.message);
  revalidatePath("/ambulance/master");
}

export async function saveAmbulance(data: { 
  id?: string; 
  name: string; 
  plate_number: string; 
  base_price_per_km: number; 
  is_active: boolean;
  image_url?: string | null;
}) {
  const supabase = await createServerSupabaseClient();
  
  if (data.id) {
    const { id, ...updateData } = data;
    const { error } = await supabase.from("ambulances").update(updateData).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("ambulances").insert([data]);
    if (error) throw new Error(error.message);
  }
  
  revalidatePath("/ambulance/master");
  revalidatePath("/ambulance/order");
}
