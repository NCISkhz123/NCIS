import {
  createSupabaseAdminAuthAdapter,
  createSupabaseProfilesAdapter,
  ensureDemoUsers,
} from "../src/lib/auth/demo-users";
import { loadNextEnv } from "../src/lib/env/load-next-env";
import { getServerEnv } from "../src/lib/env";
import { createSupabaseAdminClient } from "../src/lib/supabase/admin";

export async function bootstrapDemoAuthUsers() {
  loadNextEnv();
  const supabase = createSupabaseAdminClient();
  const env = getServerEnv();

  await ensureDemoUsers({
    adminAuth: createSupabaseAdminAuthAdapter(supabase),
    profiles: createSupabaseProfilesAdapter(supabase),
    passwords: {
      admin: env.NCIS_DEMO_ADMIN_PASSWORD,
      petugas: env.NCIS_DEMO_PETUGAS_PASSWORD,
    },
  });

  console.log("NCIS demo auth users are ready.");
}

if (process.argv[1]?.endsWith("bootstrap-demo-auth.ts")) {
  bootstrapDemoAuthUsers().catch((error) => {
    console.error(
      error instanceof Error ? error.message : "Failed to bootstrap demo auth users."
    );
    process.exit(1);
  });
}
