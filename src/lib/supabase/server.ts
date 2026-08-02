import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getPublicEnv } from "@/lib/env";
import { SUPABASE_AUTH_COOKIE_OPTIONS } from "@/lib/supabase/cookies";

type CreateServerSupabaseClientOptions = {
  writeCookies?: boolean;
};

export async function createServerSupabaseClient(
  options: CreateServerSupabaseClientOptions = {}
) {
  const env = getPublicEnv();
  const cookieStore = await cookies();
  // writeCookies is kept for backwards compatibility but we now always provide setAll
  // with a try-catch as recommended by Supabase to suppress Server Component warnings.
  const { writeCookies = false } = options;

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookieOptions: SUPABASE_AUTH_COOKIE_OPTIONS,
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  );
}
