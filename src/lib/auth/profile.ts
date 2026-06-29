import { cache } from "react";

import { createServerSupabaseClient } from "@/lib/supabase/server";

import { normalizeRole } from "./roles";

export type CurrentProfile = {
  email: string | null;
  fullName: string | null;
  role: ReturnType<typeof normalizeRole>;
  userId: string;
};

export const getCurrentProfile = cache(async (): Promise<CurrentProfile | null> => {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("email, full_name, app_role")
    .eq("user_id", user.id)
    .maybeSingle();

  return {
    email: profile?.email ?? user.email ?? null,
    fullName: profile?.full_name ?? null,
    role: normalizeRole(profile?.app_role ?? "USER"),
    userId: user.id,
  };
});
