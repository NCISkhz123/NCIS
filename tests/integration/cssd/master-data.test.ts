import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  cleanupTestDatabase,
  ensureTestDatabase,
  expectAnonFailure,
  expectAuthenticatedFailure,
  expectSqlFailure,
  runAuthenticatedSql,
  runSql,
  sqlString,
} from "./helpers/local-supabase";

describe("CSSD master data schema", () => {
  beforeAll(() => {
    ensureTestDatabase();
  }, 90_000);

  afterAll(() => {
    cleanupTestDatabase();
  }, 90_000);

  it("allows service role to create units of measure, hospital units, and items", async () => {
    const suffix = Date.now();
    const uomId = runSql(`
      insert into public.units_of_measure (code, name)
      values (${sqlString(`PCS-${suffix}`)}, ${sqlString(`Pieces ${suffix}`)})
      returning id;
    `);

    expect(uomId).toBeTruthy();

    const unitId = runSql(`
      insert into public.hospital_units (code, name)
      values (${sqlString(`ICU-${suffix}`)}, ${sqlString(`ICU ${suffix}`)})
      returning id;
    `);

    expect(unitId).toBeTruthy();

    const itemType = runSql(`
      insert into public.items (code, item_type, name, uom_id)
      values (
        ${sqlString(`ITEM-${suffix}`)},
        'REUSABLE',
        ${sqlString(`Item ${suffix}`)},
        ${sqlString(uomId)}
      )
      returning item_type;
    `);

    expect(itemType).toBe("REUSABLE");
  });

  it("rejects invalid item_type values", async () => {
    const suffix = Date.now();
    const uomId = runSql(`
      insert into public.units_of_measure (code, name)
      values (${sqlString(`BOX-${suffix}`)}, ${sqlString(`Box ${suffix}`)})
      returning id;
    `);

    const error = expectSqlFailure(`
      insert into public.items (code, item_type, name, uom_id)
      values (
        ${sqlString(`INVALID-${suffix}`)},
        'NOT_REAL',
        ${sqlString(`Broken ${suffix}`)},
        ${sqlString(uomId)}
      );
    `);

    expect(error).toContain("item_type");
  });

  it("blocks unauthenticated inserts through RLS", async () => {
    const error = expectAnonFailure(`
      insert into public.units_of_measure (code, name)
      values (${sqlString(`ANON-${Date.now()}`)}, 'Anon Should Fail');
    `);

    expect(error).toContain("permission denied");
  });

  it("allows authenticated cssd roles through RLS", async () => {
    const output = runAuthenticatedSql(
      "ADMIN_CSSD",
      `
      insert into public.units_of_measure (code, name)
      values (${sqlString(`AUTH-${Date.now()}`)}, 'Auth Should Pass')
      returning code;
    `
    );

    expect(output).toContain("AUTH-");
  });

  it("blocks authenticated non-cssd roles through RLS", async () => {
    const error = expectAuthenticatedFailure(
      "USER",
      `
      insert into public.units_of_measure (code, name)
      values (${sqlString(`USER-${Date.now()}`)}, 'User Should Fail');
    `
    );

    expect(error).toContain("row-level security policy");
  });
});
