import { randomUUID } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const DB_CONTAINER = `ncis_cssd_test_db_${process.pid}`;
const DB_IMAGE = "postgres:15-alpine";
const MIGRATIONS_DIR = path.resolve(process.cwd(), "supabase", "migrations");

function runCommand(command: string, args: string[], input?: string) {
  return spawnSync("cmd.exe", ["/c", command, ...args], {
    encoding: "utf8",
    input,
  });
}

function execPsql(sql: string) {
  return runCommand(
    "docker",
    [
      "exec",
      "-i",
      DB_CONTAINER,
      "psql",
      "-U",
      "postgres",
      "-d",
      "postgres",
      "-v",
      "ON_ERROR_STOP=1",
      "-t",
      "-A",
      "-c",
      sql,
    ],
    undefined
  );
}

function execPsqlFile(sql: string) {
  return runCommand(
    "docker",
    [
      "exec",
      "-i",
      DB_CONTAINER,
      "psql",
      "-U",
      "postgres",
      "-d",
      "postgres",
      "-v",
      "ON_ERROR_STOP=1",
      "-t",
      "-A",
    ],
    sql
  );
}

function ensureSuccess(result: ReturnType<typeof runCommand>, errorMessage: string) {
  if (result.status !== 0) {
    throw new Error(`${errorMessage}\n${result.stderr || result.stdout}`.trim());
  }

  return result;
}

function bootstrapSupabaseAuthShim() {
  const result = execPsqlFile(`
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin;
  end if;
end
$$;

create schema if not exists auth;

create table if not exists auth.users (
  id uuid primary key,
  email text unique
);

create extension if not exists pgcrypto;

create or replace function auth.jwt()
returns jsonb
language sql
stable
as $$
  select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb;
$$;

create or replace function auth.uid()
returns uuid
language sql
stable
as $$
  select nullif(auth.jwt() ->> 'sub', '')::uuid;
$$;

grant usage on schema auth to anon, authenticated, service_role;
grant execute on function auth.jwt() to anon, authenticated, service_role;
grant execute on function auth.uid() to anon, authenticated, service_role;
`);

  ensureSuccess(result, "Failed to bootstrap auth shim");
}

function applyMigrations() {
  if (!existsSync(MIGRATIONS_DIR)) {
    return;
  }

  const migrationFiles = readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of migrationFiles) {
    const sql = readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");

    if (!sql.trim()) {
      continue;
    }

    const result = execPsqlFile(sql);
    ensureSuccess(result, `Failed to apply migration ${file}`);
  }
}

export function ensureTestDatabase() {
  console.error(`[cssd-test-db] preparing ${DB_CONTAINER}`);
  runCommand("docker", ["rm", "-f", DB_CONTAINER]);

  const startResult = runCommand("docker", [
    "run",
    "--name",
    DB_CONTAINER,
    "-e",
    "POSTGRES_PASSWORD=postgres",
    "-e",
    "POSTGRES_DB=postgres",
    "-d",
    DB_IMAGE,
  ]);

  ensureSuccess(startResult, "Failed to start test database container");
  console.error(`[cssd-test-db] started ${DB_CONTAINER}`);

  let stableSuccesses = 0;

  for (let attempt = 0; attempt < 60; attempt += 1) {
    const readyResult = runCommand("docker", [
      "exec",
      "-i",
      DB_CONTAINER,
      "psql",
      "-U",
      "postgres",
      "-d",
      "postgres",
      "-t",
      "-A",
      "-c",
      "select 1;",
    ]);

    if (readyResult.status === 0) {
      stableSuccesses += 1;

      if (stableSuccesses >= 3) {
        console.error(`[cssd-test-db] ready on attempt ${attempt + 1}`);
        bootstrapSupabaseAuthShim();
        applyMigrations();
        return;
      }
    } else {
      stableSuccesses = 0;
    }

    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1000);
  }

  throw new Error("Test database did not become ready in time");
}

export function cleanupTestDatabase() {
  runCommand("docker", ["rm", "-f", DB_CONTAINER]);
}

export function sqlString(value: string) {
  return `'${value.replaceAll("'", "''")}'`;
}

export function runSql(sql: string) {
  const result = execPsqlFile(sql);

  ensureSuccess(result, "psql command failed");

  return result.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter(
      (line) =>
        !/^(INSERT|UPDATE|DELETE|BEGIN|SET|ROLLBACK|COMMIT|CREATE|ALTER|DROP|GRANT|DO)\b/.test(
          line
        )
    )
    .join("\n")
    .trim();
}

export function expectSqlFailure(sql: string) {
  const result = execPsqlFile(sql);

  if (result.status === 0) {
    throw new Error(`Expected SQL command to fail, but it succeeded:\n${sql}`);
  }

  return `${result.stdout}\n${result.stderr}`.trim();
}

export function runAuthenticatedSql(
  role: "ADMIN_CSSD" | "PETUGAS_CSSD" | "USER",
  sql: string
) {
  const claims = JSON.stringify({
    app_metadata: {
      role,
    },
    role: "authenticated",
    sub: randomUUID(),
  });

  return runSql(`
begin;
set local role authenticated;
select set_config('request.jwt.claims', ${sqlString(claims)}, true);
${sql}
rollback;
`);
}

export function runAnonSql(sql: string) {
  return runSql(`
begin;
set local role anon;
${sql}
rollback;
`);
}

export function expectAuthenticatedFailure(
  role: "ADMIN_CSSD" | "PETUGAS_CSSD" | "USER",
  sql: string
) {
  const claims = JSON.stringify({
    app_metadata: {
      role,
    },
    role: "authenticated",
    sub: randomUUID(),
  });

  return expectSqlFailure(`
begin;
set local role authenticated;
select set_config('request.jwt.claims', ${sqlString(claims)}, true);
${sql}
rollback;
`);
}

export function expectAnonFailure(sql: string) {
  return expectSqlFailure(`
begin;
set local role anon;
${sql}
rollback;
`);
}
