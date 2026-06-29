# NCIS Supabase Auth Implementation Plan

> **For agentic workers:** REQUIRED: Use `superpowers:subagent-driven-development` (if subagents available) or `superpowers:executing-plans` to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mengaktifkan login/logout Supabase berbasis email + password untuk NCIS CSSD dengan session SSR nyata, role bersumber dari `public.profiles`, dan bootstrap akun demo lokal yang aman.

**Architecture:** Next.js App Router akan memakai `@supabase/ssr` untuk session server/browser. `public.profiles` menjadi source of truth role, lalu helper auth membaca profile nyata dari database dan middleware menjaga cookie/session tetap sinkron. Bootstrap akun demo berjalan server-only memakai admin client Supabase dan password dari env lokal.

**Tech Stack:** Next.js 16, React 19, TypeScript, Supabase Auth, Supabase Postgres, `@supabase/ssr`, Zod, Vitest, Testing Library.

---

## Scope Check

Plan ini hanya untuk fase auth NCIS CSSD. Tidak mencakup Laundry, Ambulance, signup publik, atau manajemen user/role di UI.

## Locked Decisions

- Login method: email + password.
- Scope UI auth: login + logout saja.
- Produksi: user dibuat manual di Supabase Dashboard.
- Lokal/dev: sediakan akun demo dari `.env.local`.
- Role source of truth: `public.profiles.app_role`.
- Protected landing setelah login: `/cssd`.
- Gunakan `npx ui-skills start` sebelum pengerjaan UI login/logout.

## Relevant Skills

- `@executing-plans`
- `@verification-before-completion`
- `@supabase-postgres-best-practices`
- `@next-best-practices`

## File Structure

**Database**

- Create: `supabase/migrations/202606300001_profiles_auth_sync.sql`
- Modify: `supabase/seed.sql`

**Auth Foundations**

- Modify: `src/lib/env.ts`
- Modify: `src/lib/auth/profile.ts`
- Modify: `src/lib/auth/guards.ts`
- Modify: `src/lib/supabase/middleware.ts`
- Create: `src/lib/supabase/admin.ts`
- Create: `src/lib/auth/demo-users.ts`
- Create: `middleware.ts`

**UI / App Router**

- Modify: `src/app/(auth)/login/page.tsx`
- Create: `src/app/(auth)/login/actions.ts`
- Create: `src/app/(protected)/actions.ts`
- Create: `src/components/auth/login-form.tsx`
- Modify: `src/app/(protected)/layout.tsx`
- Modify: `src/components/layout/module-header.tsx`

**Scripts / Docs**

- Modify: `.env.example`
- Modify: `package.json`
- Create: `scripts/bootstrap-demo-auth.ts`
- Modify: `README.md`

**Tests**

- Modify: `tests/integration/cssd/helpers/local-supabase.ts`
- Create: `tests/integration/auth/profile-access.test.ts`
- Create: `tests/unit/auth/demo-users.test.ts`
- Create: `tests/unit/auth/login-actions.test.ts`
- Create: `tests/unit/auth/current-profile.test.ts`
- Create: `tests/unit/components/auth/login-form.test.tsx`

## Review Note

Skill ini meminta review loop per chunk. Resource `plan-document-reviewer-prompt.md` tidak tersedia di workspace ini, jadi reviewer khusus tidak bisa dipanggil secara literal. Sebagai gantinya, setiap chunk di bawah harus diself-review terhadap spec auth sebelum dieksekusi.

---

## Chunk 1: Database and Dev Bootstrap

### Task 1: Tambahkan akses profile sendiri dan sinkronisasi role SQL

**Files:**

- Create: `tests/integration/auth/profile-access.test.ts`
- Modify: `tests/integration/cssd/helpers/local-supabase.ts`
- Create: `supabase/migrations/202606300001_profiles_auth_sync.sql`

- [ ] **Step 1: Write the failing integration test for "read own profile"**

```ts
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  cleanupTestDatabase,
  ensureTestDatabase,
  runAuthenticatedSqlWithClaims,
  runSql,
} from "../cssd/helpers/local-supabase";

describe("profiles auth access", () => {
  beforeAll(() => ensureTestDatabase());
  afterAll(() => cleanupTestDatabase());

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
});
```

- [ ] **Step 2: Run the new test and verify it fails**

Run:

```bash
pnpm vitest run tests/integration/auth/profile-access.test.ts
```

Expected:

- `FAIL`
- error mirip `runAuthenticatedSqlWithClaims is not a function` atau query select ditolak policy `profiles`

- [ ] **Step 3: Add a helper that can impersonate a specific auth user**

```ts
export function runAuthenticatedSqlWithClaims(
  claims: Record<string, unknown>,
  sql: string
) {
  return runSql(`
begin;
set local role authenticated;
set local "request.jwt.claims" = ${sqlString(JSON.stringify(claims))};
${sql}
rollback;
`);
}
```

- [ ] **Step 4: Run the test again and verify it still fails for the correct reason**

Run:

```bash
pnpm vitest run tests/integration/auth/profile-access.test.ts
```

Expected:

- `FAIL`
- error policy `profiles` menolak `select`

- [ ] **Step 5: Expand the test to lock role-resolution behavior**

Tambahkan dua test lagi:

```ts
it("resolves CSSD role from the profile row for the authenticated user", () => {
  const userId = "11111111-1111-1111-1111-111111111111";

  const output = runAuthenticatedSqlWithClaims(
    {
      sub: userId,
      role: "authenticated",
    },
    `select public.current_app_role()::text;`
  );

  expect(output).toBe("ADMIN_CSSD");
});

it("falls back to USER when the authenticated user has no matching profile", () => {
  const output = runAuthenticatedSqlWithClaims(
    {
      sub: "44444444-4444-4444-4444-444444444444",
      role: "authenticated",
    },
    `select public.current_app_role()::text;`
  );

  expect(output).toBe("USER");
});
```

- [ ] **Step 6: Run the test suite and verify role-resolution tests fail**

Run:

```bash
pnpm vitest run tests/integration/auth/profile-access.test.ts
```

Expected:

- `FAIL`
- `current_app_role()` masih membaca claim lama, belum profile row

- [ ] **Step 7: Add the migration with own-profile policy and profile-backed role resolution**

```sql
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = user_id);

create or replace function public.profile_role_for_uid(target_user_id uuid)
returns public.app_role
language sql
stable
as $$
  select coalesce(
    (
      select app_role
      from public.profiles
      where user_id = target_user_id
        and is_active = true
      limit 1
    ),
    'USER'::public.app_role
  );
$$;

create or replace function public.current_app_role()
returns public.app_role
language sql
stable
as $$
  select coalesce(
    nullif(auth.jwt() -> 'app_metadata' ->> 'role', '')::public.app_role,
    nullif(auth.jwt() -> 'user_metadata' ->> 'role', '')::public.app_role,
    public.profile_role_for_uid(auth.uid()),
    'USER'::public.app_role
  );
$$;
```

- [ ] **Step 8: Reset the local Supabase DB so the migration order matches reality**

Run:

```bash
pnpm supabase db reset
```

Expected:

- local database reset selesai tanpa SQL error

- [ ] **Step 9: Run the integration test and verify it passes**

Run:

```bash
pnpm vitest run tests/integration/auth/profile-access.test.ts
```

Expected:

- `PASS`

- [ ] **Step 10: Commit the database contract change**

```bash
git add tests/integration/cssd/helpers/local-supabase.ts tests/integration/auth/profile-access.test.ts supabase/migrations/202606300001_profiles_auth_sync.sql
git commit -m "feat: align auth role resolution with profiles"
```

### Task 2: Tambahkan env server-only dan bootstrap akun demo

**Files:**

- Modify: `.env.example`
- Modify: `package.json`
- Modify: `src/lib/env.ts`
- Create: `src/lib/supabase/admin.ts`
- Create: `src/lib/auth/demo-users.ts`
- Create: `scripts/bootstrap-demo-auth.ts`
- Create: `tests/unit/auth/demo-users.test.ts`

- [ ] **Step 1: Write the failing unit test for bootstrap service**

```ts
import { describe, expect, it, vi } from "vitest";

import { ensureDemoUsers } from "../../../src/lib/auth/demo-users";

describe("ensureDemoUsers", () => {
  it("creates missing demo users with confirmed email", async () => {
    const listUsers = vi.fn().mockResolvedValue({
      data: { users: [] },
      error: null,
    });

    const createUser = vi.fn().mockResolvedValue({
      data: { user: { id: "auth-user-1" } },
      error: null,
    });

    const updateProfile = vi.fn().mockResolvedValue({
      error: null,
    });

    await ensureDemoUsers({
      adminAuth: { listUsers, createUser },
      profiles: { upsertProfile: updateProfile },
      passwords: {
        admin: "secret-admin",
        petugas: "secret-petugas",
      },
    });

    expect(createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "admin.cssd@ncis.local",
        email_confirm: true,
        password: "secret-admin",
      })
    );

    expect(updateProfile).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run the test and verify it fails because the service does not exist**

Run:

```bash
pnpm vitest run tests/unit/auth/demo-users.test.ts
```

Expected:

- `FAIL`
- module `src/lib/auth/demo-users.ts` belum ada

- [ ] **Step 3: Add env parsing for public and server-only auth settings**

```ts
const publicKeys = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

const serverKeys = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "NCIS_DEMO_ADMIN_PASSWORD",
  "NCIS_DEMO_PETUGAS_PASSWORD",
] as const;

export function getServerEnv() {
  const values = {} as Record<(typeof serverKeys)[number], string>;

  for (const key of serverKeys) {
    const value = process.env[key];

    if (!value) {
      throw new Error(`Missing required server environment variable: ${key}`);
    }

    values[key] = value;
  }

  return values;
}
```

- [ ] **Step 4: Add the demo-user bootstrap service with dependency injection**

```ts
const DEMO_USERS = [
  {
    userId: "11111111-1111-1111-1111-111111111111",
    email: "admin.cssd@ncis.local",
    fullName: "Admin CSSD",
    role: "ADMIN_CSSD",
    passwordKey: "admin" as const,
  },
  {
    userId: "22222222-2222-2222-2222-222222222222",
    email: "petugas.cssd@ncis.local",
    fullName: "Petugas CSSD",
    role: "PETUGAS_CSSD",
    passwordKey: "petugas" as const,
  },
];

export async function ensureDemoUsers(deps: EnsureDemoUsersDeps) {
  for (const demoUser of DEMO_USERS) {
    const existing = await deps.adminAuth.findUserByEmail(demoUser.email);
    const authUser =
      existing ??
      (
        await deps.adminAuth.createUser({
          email: demoUser.email,
          password: deps.passwords[demoUser.passwordKey],
          email_confirm: true,
          user_metadata: { full_name: demoUser.fullName },
        })
      ).user;

    await deps.profiles.upsertProfile({
      userId: authUser.id,
      email: demoUser.email,
      fullName: demoUser.fullName,
      role: demoUser.role,
    });
  }
}
```

- [ ] **Step 5: Create the server-only admin client wrapper**

```ts
import { createClient } from "@supabase/supabase-js";

import { getPublicEnv, getServerEnv } from "@/lib/env";

export function createSupabaseAdminClient() {
  const { NEXT_PUBLIC_SUPABASE_URL } = getPublicEnv();
  const { SUPABASE_SERVICE_ROLE_KEY } = getServerEnv();

  return createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
```

- [ ] **Step 6: Add the executable bootstrap script and package command**

```ts
import { createSupabaseAdminClient } from "../src/lib/supabase/admin";
import { getServerEnv } from "../src/lib/env";
import { ensureDemoUsers } from "../src/lib/auth/demo-users";

async function main() {
  const adminClient = createSupabaseAdminClient();
  const env = getServerEnv();

  await ensureDemoUsers({
    adminAuth: createSupabaseAdminAuthAdapter(adminClient),
    profiles: createProfilesAdapter(adminClient),
    passwords: {
      admin: env.NCIS_DEMO_ADMIN_PASSWORD,
      petugas: env.NCIS_DEMO_PETUGAS_PASSWORD,
    },
  });
}

void main();
```

Tambahkan juga:

```json
{
  "scripts": {
    "auth:bootstrap-demo": "pnpm exec tsx scripts/bootstrap-demo-auth.ts"
  },
  "devDependencies": {
    "tsx": "^4.20.6"
  }
}
```

- [ ] **Step 7: Update `.env.example` with the new server-only keys**

```dotenv
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:55321
NEXT_PUBLIC_SUPABASE_ANON_KEY=replace-with-your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=replace-with-your-supabase-service-role-key
NCIS_DEMO_ADMIN_PASSWORD=replace-with-local-admin-password
NCIS_DEMO_PETUGAS_PASSWORD=replace-with-local-petugas-password
```

- [ ] **Step 8: Run the unit test and verify it passes**

Run:

```bash
pnpm vitest run tests/unit/auth/demo-users.test.ts
```

Expected:

- `PASS`

- [ ] **Step 9: Install the new dev dependency and smoke-test the bootstrap command**

Run:

```bash
pnpm install
pnpm auth:bootstrap-demo
```

Expected:

- dependency `tsx` terpasang
- command selesai tanpa error

- [ ] **Step 10: Commit the bootstrap foundation**

```bash
git add .env.example package.json pnpm-lock.yaml src/lib/env.ts src/lib/supabase/admin.ts src/lib/auth/demo-users.ts scripts/bootstrap-demo-auth.ts tests/unit/auth/demo-users.test.ts
git commit -m "feat: add supabase demo auth bootstrap"
```

---

## Chunk 2: SSR Auth and UI

### Task 3: Implement login server action

**Files:**

- Create: `src/app/(auth)/login/actions.ts`
- Create: `tests/unit/auth/login-actions.test.ts`

- [ ] **Step 1: Write the failing unit test for invalid login input**

```ts
import { describe, expect, it } from "vitest";

import { normalizeLoginPayload } from "../../../src/app/(auth)/login/actions";

describe("normalizeLoginPayload", () => {
  it("rejects empty email and password", () => {
    expect(() =>
      normalizeLoginPayload(new FormData())
    ).toThrow("Email dan password wajib diisi");
  });
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run:

```bash
pnpm vitest run tests/unit/auth/login-actions.test.ts
```

Expected:

- `FAIL`
- module action belum ada

- [ ] **Step 3: Add the minimal parser/validator used by the server action**

```ts
"use server";

import { z } from "zod";

const loginSchema = z.object({
  email: z.email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export function normalizeLoginPayload(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Email dan password wajib diisi");
  }

  return parsed.data;
}
```

- [ ] **Step 4: Add the failing unit test for Supabase login failure**

```ts
import { describe, expect, it, vi } from "vitest";

import { loginWithPassword } from "../../../src/app/(auth)/login/actions";

it("returns a friendly error when Supabase rejects the credentials", async () => {
  const signInWithPassword = vi.fn().mockResolvedValue({
    error: { message: "Invalid login credentials" },
  });

  const result = await loginWithPassword(
    {
      auth: { signInWithPassword },
    } as never,
    {
      email: "admin.cssd@ncis.local",
      password: "wrong-password",
    }
  );

  expect(result).toEqual({
    ok: false,
    message: "Email atau password tidak sesuai.",
  });
});
```

- [ ] **Step 5: Run the test and verify it fails**

Run:

```bash
pnpm vitest run tests/unit/auth/login-actions.test.ts
```

Expected:

- `FAIL`
- `loginWithPassword` belum ada

- [ ] **Step 6: Implement the injectable login function plus real server action**

```ts
import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function loginWithPassword(
  authClient: {
    auth: {
      signInWithPassword(input: {
        email: string;
        password: string;
      }): Promise<{ error: { message: string } | null }>;
    };
  },
  input: {
    email: string;
    password: string;
  }
) {
  const { error } = await authClient.auth.signInWithPassword(input);

  if (error) {
    return {
      ok: false as const,
      message: "Email atau password tidak sesuai.",
    };
  }

  return {
    ok: true as const,
  };
}

export async function loginAction(_: unknown, formData: FormData) {
  const payload = normalizeLoginPayload(formData);
  const supabase = await createServerSupabaseClient();
  const result = await loginWithPassword(supabase, payload);

  if (!result.ok) {
    return result;
  }

  redirect("/cssd");
}
```

- [ ] **Step 7: Run the unit test and verify it passes**

Run:

```bash
pnpm vitest run tests/unit/auth/login-actions.test.ts
```

Expected:

- `PASS`

- [ ] **Step 8: Commit the login action**

```bash
git add src/app/(auth)/login/actions.ts tests/unit/auth/login-actions.test.ts
git commit -m "feat: add supabase login action"
```

### Task 4: Wire SSR profile resolution and middleware

**Files:**

- Modify: `src/lib/auth/profile.ts`
- Modify: `src/lib/auth/guards.ts`
- Modify: `src/lib/supabase/middleware.ts`
- Create: `middleware.ts`
- Create: `tests/unit/auth/current-profile.test.ts`
- Modify: `tests/integration/auth/guards.test.ts`

- [ ] **Step 1: Write the failing unit test for `getCurrentProfile()`**

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../src/lib/supabase/server", () => ({
  createServerSupabaseClient: vi.fn(),
}));

import { createServerSupabaseClient } from "../../../src/lib/supabase/server";
import { getCurrentProfile } from "../../../src/lib/auth/profile";

describe("getCurrentProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reads role from public.profiles for the authenticated user", async () => {
    vi.mocked(createServerSupabaseClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: "11111111-1111-1111-1111-111111111111",
              email: "admin.cssd@ncis.local",
            },
          },
        }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: {
                email: "admin.cssd@ncis.local",
                full_name: "Admin CSSD",
                app_role: "ADMIN_CSSD",
              },
              error: null,
            }),
          }),
        }),
      }),
    } as never);

    const profile = await getCurrentProfile();

    expect(profile?.role).toBe("ADMIN_CSSD");
    expect(profile?.email).toBe("admin.cssd@ncis.local");
  });
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run:

```bash
pnpm vitest run tests/unit/auth/current-profile.test.ts
```

Expected:

- `FAIL`
- current implementation masih membaca metadata, belum query `profiles`

- [ ] **Step 3: Update `getCurrentProfile()` to query `public.profiles`**

```ts
export type CurrentProfile = {
  email: string | null;
  fullName: string | null;
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("email, full_name, app_role")
    .eq("user_id", user.id)
    .maybeSingle();

  return {
    email: profile?.email ?? user.email ?? null,
    fullName: profile?.full_name ?? null,
    role: normalizeRole(profile?.app_role ?? "USER"),
    userId: user.id,
  };
});
```

- [ ] **Step 4: Add a guard regression test that non-CSSD users are still rejected**

```ts
it("still denies authenticated users without cssd role", () => {
  expect(
    decideCssdRouteAccess({
      pathname: "/cssd/pemasukan",
      userId: "user-1",
      role: "USER",
    })
  ).toEqual({
    allowed: false,
    redirectTo: "/login",
    reason: "forbidden",
  });
});
```

- [ ] **Step 5: Run the guard and profile tests together**

Run:

```bash
pnpm vitest run tests/unit/auth/current-profile.test.ts tests/integration/auth/guards.test.ts
```

Expected:

- `PASS`

- [ ] **Step 6: Create the root middleware and preserve Supabase response/cookies**

```ts
import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js)$).*)",
  ],
};
```

- [ ] **Step 7: Tighten `src/lib/supabase/middleware.ts` to follow the documented SSR pattern**

```ts
const {
  data: { user },
} = await supabase.auth.getUser();

void user;

return supabaseResponse;
```

Catatan implementasi:

- jangan sisipkan logic lain di antara `createServerClient(...)` dan `supabase.auth.getUser()`
- jika membuat response baru, copy cookies dari `supabaseResponse`

- [ ] **Step 8: Run a build to verify the new root middleware is valid**

Run:

```bash
pnpm build
```

Expected:

- `build` sukses

- [ ] **Step 9: Commit the SSR auth wiring**

```bash
git add src/lib/auth/profile.ts src/lib/auth/guards.ts src/lib/supabase/middleware.ts middleware.ts tests/unit/auth/current-profile.test.ts tests/integration/auth/guards.test.ts
git commit -m "feat: connect ssr auth to profile resolution"
```

### Task 5: Build login/logout UI and connect it to actions

**Files:**

- Modify: `src/app/(auth)/login/page.tsx`
- Create: `src/components/auth/login-form.tsx`
- Create: `src/app/(protected)/actions.ts`
- Modify: `src/app/(protected)/layout.tsx`
- Modify: `src/components/layout/module-header.tsx`
- Create: `tests/unit/components/auth/login-form.test.tsx`

- [ ] **Step 1: Run the required UI tool before touching the login form**

Run:

```bash
npx ui-skills start
```

Expected:

- tool berjalan tanpa error

- [ ] **Step 2: Write the failing component test for the login form**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LoginForm } from "../../../../src/components/auth/login-form";

describe("LoginForm", () => {
  it("renders email, password, and submit controls", () => {
    render(<LoginForm action={vi.fn()} />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /masuk ke cssd/i })
    ).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run the component test and verify it fails**

Run:

```bash
pnpm vitest run tests/unit/components/auth/login-form.test.tsx
```

Expected:

- `FAIL`
- komponen `LoginForm` belum ada

- [ ] **Step 4: Build the client form component with server action state**

```tsx
"use client";

import { useActionState } from "react";

type LoginFormProps = {
  action: (state: unknown, formData: FormData) => Promise<unknown>;
};

export function LoginForm({ action }: LoginFormProps) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-4">
      <label className="grid gap-2 text-sm font-medium text-slate-700">
        Email
        <input name="email" type="email" className="rounded-xl border px-4 py-3" />
      </label>

      <label className="grid gap-2 text-sm font-medium text-slate-700">
        Password
        <input name="password" type="password" className="rounded-xl border px-4 py-3" />
      </label>

      {"message" in (state ?? {}) ? (
        <p className="text-sm text-rose-600">{(state as { message: string }).message}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
      >
        {pending ? "Memproses..." : "Masuk ke CSSD"}
      </button>
    </form>
  );
}
```

- [ ] **Step 5: Replace the placeholder login page with the real NCIS login shell**

```tsx
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { loginAction } from "./actions";
import { getCurrentProfile } from "@/lib/auth/profile";

export default async function LoginPage() {
  const profile = await getCurrentProfile();

  if (profile) {
    redirect("/cssd");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="space-y-2">
          <p className="text-lg font-semibold uppercase tracking-[0.3em] text-slate-500">
            NCIS
          </p>
          <p className="text-sm text-slate-500">Non Clinical Integrated System</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Login CSSD</h1>
        </div>

        <div className="mt-6">
          <LoginForm action={loginAction} />
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 6: Add a logout server action and expose it from the protected shell**

```ts
"use server";

import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function logoutAction() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/login");
}
```

- [ ] **Step 7: Pass the logout action into the header and render a logout button**

Tambahkan prop di `ModuleHeader`:

```ts
type ModuleHeaderProps = {
  roleLabel: string;
  email: string | null;
  logoutAction: () => Promise<void>;
};
```

Render button:

```tsx
<form action={logoutAction}>
  <button
    type="submit"
    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm"
  >
    Logout
  </button>
</form>
```

Di `src/app/(protected)/layout.tsx`, teruskan action ini ke header shell yang sesuai.

- [ ] **Step 8: Run the component test plus the login action test**

Run:

```bash
pnpm vitest run tests/unit/components/auth/login-form.test.tsx tests/unit/auth/login-actions.test.ts
```

Expected:

- `PASS`

- [ ] **Step 9: Start the app and perform a manual auth smoke test**

Run:

```bash
pnpm dev
```

Check manually:

- `/login` menampilkan branding `NCIS` besar dan subtitle `Non Clinical Integrated System`
- login sukses dengan akun demo admin mengarah ke `/cssd`
- login gagal menampilkan pesan ramah
- logout mengembalikan user ke `/login`

- [ ] **Step 10: Commit the auth UI**

```bash
git add src/app/(auth)/login/page.tsx src/components/auth/login-form.tsx src/app/(protected)/actions.ts src/app/(protected)/layout.tsx src/components/layout/module-header.tsx tests/unit/components/auth/login-form.test.tsx
git commit -m "feat: add ncis login and logout ui"
```

---

## Chunk 3: Docs and Final Verification

### Task 6: Document the flow and verify it end to end

**Files:**

- Modify: `README.md`
- Modify: `supabase/seed.sql`

- [ ] **Step 1: Update the README with exact auth setup steps**

Tambahkan section yang mencakup:

```md
## Supabase Auth Lokal

1. Isi `.env.local` dengan:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NCIS_DEMO_ADMIN_PASSWORD`
   - `NCIS_DEMO_PETUGAS_PASSWORD`
2. Jalankan `pnpm supabase:start`
3. Jalankan `pnpm supabase db reset`
4. Jalankan `pnpm auth:bootstrap-demo`
5. Login dengan `admin.cssd@ncis.local` atau `petugas.cssd@ncis.local`
```

- [ ] **Step 2: Ensure `supabase/seed.sql` remains compatible with the bootstrap flow**

Pastikan seed masih hanya mengurus row `public.profiles` dan master data referensi, bukan mencoba mengisi password atau data auth yang semestinya dibuat oleh admin API.

- [ ] **Step 3: Run the focused auth tests**

Run:

```bash
pnpm vitest run tests/integration/auth/profile-access.test.ts tests/integration/auth/guards.test.ts tests/unit/auth/demo-users.test.ts tests/unit/auth/login-actions.test.ts tests/unit/auth/current-profile.test.ts tests/unit/components/auth/login-form.test.tsx
```

Expected:

- semua test auth `PASS`

- [ ] **Step 4: Run the whole project verification**

Run:

```bash
pnpm check
```

Expected:

- lint, typecheck, test, dan build sukses

- [ ] **Step 5: Reset the local Supabase DB one last time and re-bootstrap demos**

Run:

```bash
pnpm supabase db reset
pnpm auth:bootstrap-demo
```

Expected:

- reset dan bootstrap selesai tanpa error

- [ ] **Step 6: Commit the documentation and verification pass**

```bash
git add README.md supabase/seed.sql
git commit -m "docs: document ncis supabase auth setup"
```

---

## Execution Order

1. Chunk 1 / Task 1
2. Chunk 1 / Task 2
3. Chunk 2 / Task 3
4. Chunk 2 / Task 4
5. Chunk 2 / Task 5
6. Chunk 3 / Task 6

## Definition of Done

- User bisa login dan logout memakai Supabase Auth.
- `/login` tidak lagi placeholder.
- Session SSR tetap sinkron melalui middleware.
- `getCurrentProfile()` membaca `public.profiles`.
- Role CSSD tetap membatasi akses `/cssd`.
- Akun demo lokal bisa dibuat ulang secara idempotent dari env.
- README cukup jelas untuk developer berikutnya.

Plan complete and saved to `docs/superpowers/plans/2026-06-30-ncis-supabase-auth.md`. Ready to execute?
