import {
  createSupabaseAdminAuthAdapter,
  createSupabaseProfilesAdapter,
  ensureDemoUsers,
} from "../src/lib/auth/demo-users";
import { getServerEnv } from "../src/lib/env";
import { createSupabaseAdminClient } from "../src/lib/supabase/admin";

async function main() {
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

main().catch((error) => {
  console.error(
    error instanceof Error ? error.message : "Failed to bootstrap demo auth users."
  );
  process.exit(1);
});
