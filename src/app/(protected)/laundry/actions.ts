"use server";

import { revalidatePath } from "next/cache";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function deleteLaundryTransactionAction(
  movementId: string,
  reason: string
) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "User not authenticated" };
  }

  const { data, error } = await supabase.rpc("delete_laundry_stock_movement", {
    p_movement_id: movementId,
    p_actor_user_id: user.id,
    p_reason: reason,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/laundry", "layout");

  return { success: true };
}

