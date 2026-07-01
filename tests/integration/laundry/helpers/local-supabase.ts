import { randomUUID } from "node:crypto";

import {
  cleanupTestDatabase,
  ensureTestDatabase,
  expectAnonFailure,
  expectSqlFailure,
  runSql,
  sqlString,
} from "../../cssd/helpers/local-supabase";
import type {
  ReportQueryClient,
  ReportView,
} from "@/lib/laundry/services/reports";

type LaundryAuthRole =
  | "ADMIN_CSSD"
  | "PETUGAS_CSSD"
  | "ADMIN_LAUNDRY"
  | "PETUGAS_LAUNDRY"
  | "USER";

function buildAuthenticatedSql(role: LaundryAuthRole, sql: string) {
  const userId = randomUUID();
  const claims = JSON.stringify({
    app_metadata: {
      role,
    },
    role: "authenticated",
    sub: userId,
  });

  return `
begin;
insert into public.profiles (user_id, email, full_name, app_role)
values (
  ${sqlString(userId)},
  ${sqlString(`${role.toLowerCase()}-${userId}@ncis.test`)},
  ${sqlString(`${role} Test User`)},
  ${sqlString(role)}
)
on conflict (user_id) do update
set email = excluded.email,
    full_name = excluded.full_name,
    app_role = excluded.app_role,
    is_active = true;
set local role authenticated;
set local "request.jwt.claims" = ${sqlString(claims)};
${sql}
rollback;
`;
}

export {
  cleanupTestDatabase,
  ensureTestDatabase,
  expectAnonFailure,
  expectSqlFailure,
  runSql,
  sqlString,
};

export function runAuthenticatedSql(role: LaundryAuthRole, sql: string) {
  return runSql(buildAuthenticatedSql(role, sql));
}

export function expectAuthenticatedFailure(role: LaundryAuthRole, sql: string) {
  return expectSqlFailure(buildAuthenticatedSql(role, sql));
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
  role: LaundryAuthRole,
  functionName: string,
  args: Record<string, unknown>
) {
  const userId = randomUUID();
  const namedArguments = Object.entries(args)
    .map(([key, value]) => `${key} := ${toSqlLiteral(value)}`)
    .join(",\n        ");

  const output = runSql(`
begin;
insert into public.profiles (user_id, email, full_name, app_role)
values (
  ${sqlString(userId)},
  ${sqlString(`${role.toLowerCase()}-${userId}@ncis.test`)},
  ${sqlString(`${role} Test User`)},
  ${sqlString(role)}
);
set local role authenticated;
set local "request.jwt.claims" = ${sqlString(
    JSON.stringify({
      app_metadata: {
        role,
      },
      role: "authenticated",
      sub: userId,
    })
  )};
select jsonb_build_object(
  'result',
  public.${functionName}(
    ${namedArguments}
  )
)::text;
commit;
`);

  const parsed = JSON.parse(output) as { result: T };
  return parsed.result;
}

export function createTestRpcClient(
  role: "ADMIN_LAUNDRY" | "PETUGAS_LAUNDRY" | "USER"
) {
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

export function createUnitOfMeasure(code = `PCS-L-${Date.now()}`) {
  return runSql(`
    insert into public.laundry_units_of_measure (code, name)
    values (${sqlString(code)}, ${sqlString(`Unit Laundry ${code}`)})
    returning id;
  `);
}

export function createHospitalUnit(code = `UNIT-L-${Date.now()}`) {
  return runSql(`
    insert into public.laundry_hospital_units (code, name)
    values (${sqlString(code)}, ${sqlString(`Laundry Unit ${code}`)})
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
  const code = params.code ?? `LAUNDRY-ITEM-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const name = params.name ?? `Laundry Item ${code}`;

  return runSql(`
    insert into public.laundry_items (code, item_type, name, uom_id)
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
      update public.laundry_stock_balances
      set quantity = ${params.quantity}
      where item_id = ${sqlString(params.itemId)}
        and stock_position = ${sqlString(params.stockPosition)}
        and (
          (${params.hospitalUnitId ? sqlString(params.hospitalUnitId) : "null"} is null and hospital_unit_id is null)
          or hospital_unit_id = ${params.hospitalUnitId ? sqlString(params.hospitalUnitId) : "null"}
        )
      returning id
    )
    insert into public.laundry_stock_balances (item_id, stock_position, hospital_unit_id, quantity)
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
      from public.laundry_stock_balances
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
    from public.laundry_stock_movements
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

function buildReportFilterClause(
  filters:
    | Array<{
        column: string;
        operator: "eq" | "gte" | "lte";
        value: unknown;
      }>
    | undefined
) {
  const clauses = (filters ?? [])
    .filter((filter) => filter.value !== undefined)
    .map((filter) => {
      if (filter.operator === "eq") {
        if (filter.value === null) {
          return `${filter.column} is null`;
        }

        return `${filter.column} = ${toSqlLiteral(filter.value)}`;
      }

      if (filter.operator === "gte") {
        return `${filter.column} >= ${toSqlLiteral(filter.value)}`;
      }

      return `${filter.column} <= ${toSqlLiteral(filter.value)}`;
    });

  if (!clauses.length) {
    return "";
  }

  return `where ${clauses.join(" and ")}`;
}

export function createSqlReportClient(
  role: "ADMIN_LAUNDRY" | "PETUGAS_LAUNDRY" | "USER"
): ReportQueryClient {
  return {
    async findMany<T>(
      view: ReportView,
      options?: {
        filters?: Array<{
          column: string;
          operator: "eq" | "gte" | "lte";
          value: unknown;
        }>;
        orderBy?: { column: string; ascending?: boolean };
        limit?: number;
      }
    ) {
      try {
        const whereClause = buildReportFilterClause(options?.filters);
        const orderClause = options?.orderBy
          ? `order by ${options.orderBy.column} ${
              options.orderBy.ascending === false ? "desc" : "asc"
            }`
          : "";
        const limitClause =
          typeof options?.limit === "number" ? `limit ${options.limit}` : "";

        const output = runAuthenticatedSql(
          role,
          `
            select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb)::text
            from (
              select *
              from public.${view}
              ${whereClause}
              ${orderClause}
              ${limitClause}
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
  };
}
