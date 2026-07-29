export const SUPABASE_AUTH_COOKIE_NAME = "sb-ncis-cssd-mvp-auth-token";

export const SUPABASE_AUTH_COOKIE_OPTIONS = {
  name: SUPABASE_AUTH_COOKIE_NAME,
};

export function getDefaultSupabaseAuthCookieName(supabaseUrl: string) {
  const hostnamePrefix = new URL(supabaseUrl).hostname.split(".")[0];

  return `sb-${hostnamePrefix}-auth-token`;
}

export function getSupabaseAuthCookieNamesToClear(supabaseUrl: string) {
  return Array.from(
    new Set([
      SUPABASE_AUTH_COOKIE_NAME,
      getDefaultSupabaseAuthCookieName(supabaseUrl),
    ])
  );
}
