const requiredKeys = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

type PublicEnvKey = (typeof requiredKeys)[number];

export function getPublicEnv() {
  const values = {} as Record<PublicEnvKey, string>;

  for (const key of requiredKeys) {
    const value = process.env[key];

    if (!value) {
      throw new Error(`Missing required environment variable: ${key}`);
    }

    values[key] = value;
  }

  return values;
}
