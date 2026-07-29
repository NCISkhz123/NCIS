import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { loadNextEnv } from "../../../../src/lib/env/load-next-env";

const ENV_KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NCIS_DEMO_ADMIN_PASSWORD",
  "NCIS_DEMO_PETUGAS_PASSWORD",
] as const;

describe("loadNextEnv", () => {
  afterEach(() => {
    for (const key of ENV_KEYS) {
      delete process.env[key];
    }
  });

  it("loads variables from .env.local for standalone scripts", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "ncis-env-"));

    fs.writeFileSync(
      path.join(tempDir, ".env.test.local"),
      [
        "NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:55321",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY=test-anon",
        "SUPABASE_SERVICE_ROLE_KEY=test-service-role",
        "NCIS_DEMO_ADMIN_PASSWORD=admin-secret",
        "NCIS_DEMO_PETUGAS_PASSWORD=petugas-secret",
      ].join("\n")
    );

    loadNextEnv(tempDir);

    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBe("http://127.0.0.1:55321");
    expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe("test-anon");
    expect(process.env.SUPABASE_SERVICE_ROLE_KEY).toBe("test-service-role");
    expect(process.env.NCIS_DEMO_ADMIN_PASSWORD).toBe("admin-secret");
    expect(process.env.NCIS_DEMO_PETUGAS_PASSWORD).toBe("petugas-secret");
  });
});
