import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  cleanupTestDatabase,
  ensureTestDatabase,
  runAuthenticatedSqlWithClaims,
  runSql,
} from "../cssd/helpers/local-supabase";

describe("profiles auth access", () => {
  beforeAll(() => {
    ensureTestDatabase();
  }, 90_000);

  afterAll(() => {
    cleanupTestDatabase();
  }, 90_000);

  it("allows an authenticated user to read their own profile row", () => {
    const userId = "33333333-3333-3333-3333-333333333333";

    runSql(`
      insert into public.profiles (user_id, email, full_name, app_role)
      values (
        '${userId}',
        'perawat.cssd@ncis.local',
        'Perawat CSSD',
        'USER'
      )
      on conflict (user_id) do update
      set email = excluded.email,
          full_name = excluded.full_name,
          app_role = excluded.app_role;
    `);

    const output = runAuthenticatedSqlWithClaims(
      {
        sub: userId,
        role: "authenticated",
      },
      `
        select email
        from public.profiles
        where user_id = '${userId}';
      `
    );

    expect(output).toBe("perawat.cssd@ncis.local");
  });

  it("resolves CSSD role from the profile row for the authenticated user", () => {
    const userId = "11111111-1111-1111-1111-111111111111";

    runSql(`
      insert into public.profiles (user_id, email, full_name, app_role)
      values (
        '${userId}',
        'admin.cssd@ncis.local',
        'Admin CSSD',
        'ADMIN_CSSD'
      )
      on conflict (user_id) do update
      set email = excluded.email,
          full_name = excluded.full_name,
          app_role = excluded.app_role,
          is_active = true;
    `);

    const output = runAuthenticatedSqlWithClaims(
      {
        sub: userId,
        role: "authenticated",
      },
      "select public.current_app_role()::text;"
    );

    expect(output).toBe("ADMIN_CSSD");
  });

  it("falls back to USER when the authenticated user has no matching profile", () => {
    const output = runAuthenticatedSqlWithClaims(
      {
        sub: "44444444-4444-4444-4444-444444444444",
        role: "authenticated",
      },
      "select public.current_app_role()::text;"
    );

    expect(output).toBe("USER");
  });
});
