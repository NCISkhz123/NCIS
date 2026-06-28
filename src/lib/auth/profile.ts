import { cache } from "react";

import { createServerSupabaseClient } from "@/lib/supabase/server";

import { normalizeRole } from "./roles";

export type CurrentProfile = {
  email: string | null;
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

  const rawRole =
    user.app_metadata?.role ??
    user.user_metadata?.role ??
    user.user_metadata?.app_role;

  return {
    email: user.email ?? null,
    role: normalizeRole(rawRole),
    userId: user.id,
  };
});
