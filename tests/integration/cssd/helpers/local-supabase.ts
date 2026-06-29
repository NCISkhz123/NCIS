import { randomUUID } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const DB_CONTAINER = `ncis_cssd_test_db_${process.pid}_${Math.random()
  .toString(36)
  .slice(2, 8)}`;
const DB_IMAGE = "postgres:15-alpine";
const MIGRATIONS_DIR = path.resolve(process.cwd(), "supabase", "migrations");

function runCommand(command: string, args: string[], input?: string) {
  return spawnSync("cmd.exe", ["/c", command, ...args], {
    encoding: "utf8",
    input,
  });
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
set local "request.jwt.claims" = ${sqlString(claims)};
${sql}
rollback;
`);
}

export function runCommittedAuthenticatedSql(
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
set local "request.jwt.claims" = ${sqlString(claims)};
${sql}
commit;
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
set local "request.jwt.claims" = ${sqlString(claims)};
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

function toSqlLiteral(value: unknown): string {
  if (value === null || value === undefined) {
    return "null";
  }

  if (value instanceof Date) {
    return sqlString(value.toISOString());
  }

  if (Array.isArray(value)) {
    return `array[${value.map((entry) => toSqlLiteral(entry)).join(", ")}]`;
  }

  switch (typeof value) {
    case "boolean":
      return value ? "true" : "false";
    case "number":
      return Number.isFinite(value) ? String(value) : "null";
    case "string":
      return sqlString(value);
    default:
      return sqlString(JSON.stringify(value));
  }
}

export function callAuthenticatedFunction<T>(
  role: "ADMIN_CSSD" | "PETUGAS_CSSD" | "USER",
  functionName: string,
  args: Record<string, unknown>
) {
  const namedArguments = Object.entries(args)
    .map(([key, value]) => `${key} := ${toSqlLiteral(value)}`)
    .join(",\n        ");

  const output = runCommittedAuthenticatedSql(
    role,
    `
      select jsonb_build_object(
        'result',
        public.${functionName}(
          ${namedArguments}
        )
      )::text;
    `
  );

  const parsed = JSON.parse(output) as { result: T };
  return parsed.result;
}

export function createTestRpcClient(role: "ADMIN_CSSD" | "PETUGAS_CSSD" | "USER") {
  return {
    async rpc<T>(functionName: string, args: Record<string, unknown>) {
      try {
        const data = callAuthenticatedFunction<T>(role, functionName, args);

        return {
          data,
          error: null,
        };
      } catch (error) {
        return {
          data: null,
          error: {
            message: error instanceof Error ? error.message : String(error),
          },
        };
      }
    },
  };
}

export function createUnitOfMeasure(code = `PCS-${Date.now()}`) {
  return runSql(`
    insert into public.units_of_measure (code, name)
    values (${sqlString(code)}, ${sqlString(`Unit ${code}`)})
    returning id;
  `);
}

export function createHospitalUnit(code = `UNIT-${Date.now()}`) {
  return runSql(`
    insert into public.hospital_units (code, name)
    values (${sqlString(code)}, ${sqlString(`Hospital Unit ${code}`)})
    returning id;
  `);
}

export function createItem(params: {
  itemType: "REUSABLE" | "CONSUMABLE_DISTRIBUTION" | "CONSUMABLE_INTERNAL";
  uomId?: string;
  code?: string;
  name?: string;
}) {
  const uomId = params.uomId ?? createUnitOfMeasure();
  const code = params.code ?? `ITEM-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const name = params.name ?? `Item ${code}`;

  return runSql(`
    insert into public.items (code, item_type, name, uom_id)
    values (
      ${sqlString(code)},
      ${sqlString(params.itemType)},
      ${sqlString(name)},
      ${sqlString(uomId)}
    )
    returning id;
  `);
}

export function seedStockBalance(params: {
  itemId: string;
  stockPosition: "READY" | "IN_UNIT" | "NON_STERILE" | "STERILIZATION_AREA" | "DAMAGED";
  quantity: number;
  hospitalUnitId?: string | null;
}) {
  return runSql(`
    with updated as (
      update public.stock_balances
      set quantity = ${params.quantity}
      where item_id = ${sqlString(params.itemId)}
        and stock_position = ${sqlString(params.stockPosition)}
        and (
          (${params.hospitalUnitId ? sqlString(params.hospitalUnitId) : "null"} is null and hospital_unit_id is null)
          or hospital_unit_id = ${params.hospitalUnitId ? sqlString(params.hospitalUnitId) : "null"}
        )
      returning id
    )
    insert into public.stock_balances (item_id, stock_position, hospital_unit_id, quantity)
    select
      ${sqlString(params.itemId)},
      ${sqlString(params.stockPosition)},
      ${params.hospitalUnitId ? sqlString(params.hospitalUnitId) : "null"},
      ${params.quantity}
    where not exists (select 1 from updated)
    returning id;
  `);
}

export function getStockBalance(params: {
  itemId: string;
  stockPosition: "READY" | "IN_UNIT" | "NON_STERILE" | "STERILIZATION_AREA" | "DAMAGED";
  hospitalUnitId?: string | null;
}) {
  const output = runSql(`
    select coalesce((
      select quantity
      from public.stock_balances
      where item_id = ${sqlString(params.itemId)}
        and stock_position = ${sqlString(params.stockPosition)}
        and (
          (${params.hospitalUnitId ? sqlString(params.hospitalUnitId) : "null"} is null and hospital_unit_id is null)
          or hospital_unit_id = ${params.hospitalUnitId ? sqlString(params.hospitalUnitId) : "null"}
        )
      limit 1
    ), 0);
  `);

  return Number(output);
}

export function getLatestMovement(params: { itemId: string }) {
  const output = runSql(`
    select jsonb_build_object(
      'movement_type', movement_type,
      'from_position', from_position,
      'to_position', to_position,
      'hospital_unit_id', hospital_unit_id,
      'quantity', quantity
    )::text
    from public.stock_movements
    where item_id = ${sqlString(params.itemId)}
    order by created_at desc
    limit 1;
  `);

  return JSON.parse(output) as {
    movement_type: string;
    from_position: string | null;
    to_position: string | null;
    hospital_unit_id: string | null;
    quantity: number;
  };
}

type MasterDataTable = "units_of_measure" | "hospital_units" | "items";

const TABLE_COLUMN_MAP: Record<MasterDataTable, string[]> = {
  units_of_measure: ["id", "code", "name", "is_active", "created_at", "updated_at"],
  hospital_units: ["id", "code", "name", "is_active", "created_at", "updated_at"],
  items: [
    "id",
    "code",
    "name",
    "item_type",
    "uom_id",
    "notes",
    "is_active",
    "created_at",
    "updated_at",
  ],
};

function buildWhereClause(filters: Record<string, unknown>) {
  const entries = Object.entries(filters).filter(([, value]) => value !== undefined);

  if (entries.length === 0) {
    return "";
  }

  const clauses = entries.map(([key, value]) => {
    if (value === null) {
      return `${key} is null`;
    }

    return `${key} = ${toSqlLiteral(value)}`;
  });

  return `where ${clauses.join(" and ")}`;
}

export type MasterDataQueryClient = {
  findMany<T>(
    table: MasterDataTable,
    options?: {
      filters?: Record<string, unknown>;
      orderBy?: { column: string; ascending?: boolean };
    }
  ): Promise<{ data: T[] | null; error: { message: string } | null }>;
  insertOne<T>(
    table: MasterDataTable,
    payload: Record<string, unknown>
  ): Promise<{ data: T | null; error: { message: string } | null }>;
  updateById<T>(
    table: MasterDataTable,
    id: string,
    payload: Record<string, unknown>
  ): Promise<{ data: T | null; error: { message: string } | null }>;
};

export function createMasterDataClient(
  role: "ADMIN_CSSD" | "PETUGAS_CSSD" | "USER"
): MasterDataQueryClient {
  return {
    async findMany<T>(
      table: MasterDataTable,
      options?: {
        filters?: Record<string, unknown>;
        orderBy?: { column: string; ascending?: boolean };
      }
    ) {
      try {
        const whereClause = buildWhereClause(options?.filters ?? {});
        const orderClause = options?.orderBy
          ? `order by ${options.orderBy.column} ${
              options.orderBy.ascending === false ? "desc" : "asc"
            }`
          : "";

        const output = runAuthenticatedSql(
          role,
          `
            select coalesce(
              jsonb_agg(row_to_json(t) ${orderClause ? `order by t.${options?.orderBy?.column} ${options?.orderBy?.ascending === false ? "desc" : "asc"}` : ""}),
              '[]'::jsonb
            )::text
            from (
              select ${TABLE_COLUMN_MAP[table].join(", ")}
              from public.${table}
              ${whereClause}
              ${orderClause}
            ) t;
          `
        );

        return {
          data: JSON.parse(output) as T[],
          error: null,
        };
      } catch (error) {
        return {
          data: null,
          error: {
            message: error instanceof Error ? error.message : String(error),
          },
        };
      }
    },
    async insertOne<T>(table: MasterDataTable, payload: Record<string, unknown>) {
      try {
        const columns = Object.keys(payload);
        const values = Object.values(payload);
        const output = runCommittedAuthenticatedSql(
          role,
          `
            with inserted as (
              insert into public.${table} (${columns.join(", ")})
              values (${values.map((value) => toSqlLiteral(value)).join(", ")})
              returning ${TABLE_COLUMN_MAP[table].join(", ")}
            )
            select row_to_json(inserted)::text
            from inserted;
          `
        );

        return {
          data: JSON.parse(output) as T,
          error: null,
        };
      } catch (error) {
        return {
          data: null,
          error: {
            message: error instanceof Error ? error.message : String(error),
          },
        };
      }
    },
    async updateById<T>(
      table: MasterDataTable,
      id: string,
      payload: Record<string, unknown>
    ) {
      try {
        const updates = Object.entries(payload)
          .map(([key, value]) => `${key} = ${toSqlLiteral(value)}`)
          .join(", ");

        const output = runCommittedAuthenticatedSql(
          role,
          `
            with updated as (
              update public.${table}
              set ${updates}
              where id = ${sqlString(id)}
              returning ${TABLE_COLUMN_MAP[table].join(", ")}
            )
            select row_to_json(updated)::text
            from updated;
          `
        );

        return {
          data: JSON.parse(output) as T,
          error: null,
        };
      } catch (error) {
        return {
          data: null,
          error: {
            message: error instanceof Error ? error.message : String(error),
          },
        };
      }
    },
  };
}
