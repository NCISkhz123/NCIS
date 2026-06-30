import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getPublicEnv } from "@/lib/env";

type CreateServerSupabaseClientOptions = {
  writeCookies?: boolean;
};

export async function createServerSupabaseClient(
  options: CreateServerSupabaseClientOptions = {}
) {
  const env = getPublicEnv();
  const cookieStore = await cookies();
  const { writeCookies = false } = options;

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        ...(writeCookies
          ? {
              setAll(cookiesToSet: {
                name: string;
                value: string;
                options?: Parameters<typeof cookieStore.set>[2];
              }[]) {
                cookiesToSet.forEach(({ name, value, options }) => {
                  cookieStore.set(name, value, options);
                });
              },
            }
          : {}),
      },
    }
  );
}
