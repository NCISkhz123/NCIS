"use server";

import { revalidatePath } from "next/cache";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function deleteAmbulanceTransactionAction(
  transactionId: string,
  reason: string
) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "User not authenticated" };
  }

  const { data, error } = await supabase.rpc("delete_ambulance_transaction", {
    p_transaction_id: transactionId,
    p_actor_user_id: user.id,
    p_reason: reason,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/ambulance", "layout");

  return { success: true };
}

