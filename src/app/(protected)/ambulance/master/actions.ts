"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveAmbulanceSettings(data: { hospital_lat: number, hospital_lng: number }) {
  const supabase = await createServerSupabaseClient();
  
  const { data: existing } = await supabase.from("ambulance_settings").select("id").limit(1).maybeSingle();
  
  if (existing) {
    const { error } = await supabase.from("ambulance_settings").update(data).eq("id", existing.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("ambulance_settings").insert([data]);
    if (error) throw new Error(error.message);
  }
  
  revalidatePath("/ambulance/master");
}

export async function saveAmbulance(data: { id?: string, name: string, plate_number: string, base_price_per_km: number, is_active: boolean }) {
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
}
