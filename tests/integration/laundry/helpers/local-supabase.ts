import { randomUUID } from "node:crypto";

import {
  cleanupTestDatabase,
  ensureTestDatabase,
  expectAnonFailure,
  expectSqlFailure,
  runSql,
  sqlString,
} from "../../cssd/helpers/local-supabase";

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
