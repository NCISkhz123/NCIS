const publicKeys = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

const serverKeys = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "NCIS_DEMO_ADMIN_PASSWORD",
  "NCIS_DEMO_PETUGAS_PASSWORD",
] as const;

type PublicEnvKey = (typeof publicKeys)[number];
type ServerEnvKey = (typeof serverKeys)[number];

export function getPublicEnv() {
  const values = {} as Record<PublicEnvKey, string>;

  for (const key of publicKeys) {
    const value = process.env[key];

    if (!value) {
      throw new Error(`Missing required environment variable: ${key}`);
    }

    values[key] = value;
  }

  return values;
}

export function getServerEnv() {
  const values = {} as Record<ServerEnvKey, string>;

  for (const key of serverKeys) {
    const value = process.env[key];

    if (!value) {
      throw new Error(`Missing required server environment variable: ${key}`);
    }

    values[key] = value;
  }

  return values;
}
