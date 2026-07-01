import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  cleanupTestDatabase,
  ensureTestDatabase,
  expectAnonFailure,
  expectAuthenticatedFailure,
  runAuthenticatedSql,
  runSql,
  sqlString,
} from "./helpers/local-supabase";

describe("Laundry master data schema", () => {
  beforeAll(() => {
    ensureTestDatabase();
  }, 90_000);

  afterAll(() => {
    cleanupTestDatabase();
  }, 90_000);

  it("allows service role to create laundry units of measure, hospital units, and items", () => {
    const suffix = Date.now();
    const uomId = runSql(`
      insert into public.laundry_units_of_measure (code, name)
      values (${sqlString(`PCS-L-${suffix}`)}, ${sqlString(`Pieces Laundry ${suffix}`)})
      returning id;
    `);

    expect(uomId).toBeTruthy();

    const unitId = runSql(`
      insert into public.laundry_hospital_units (code, name)
      values (${sqlString(`WARD-L-${suffix}`)}, ${sqlString(`Ward Laundry ${suffix}`)})
      returning id;
    `);

    expect(unitId).toBeTruthy();

    const itemType = runSql(`
      insert into public.laundry_items (code, item_type, name, uom_id)
      values (
        ${sqlString(`LAUNDRY-${suffix}`)},
        'REUSABLE',
        ${sqlString(`Laundry Item ${suffix}`)},
        ${sqlString(uomId)}
      )
      returning item_type;
    `);

    expect(itemType).toBe("REUSABLE");
  });

  it("blocks unauthenticated inserts through Laundry RLS", () => {
    const error = expectAnonFailure(`
      insert into public.laundry_units_of_measure (code, name)
      values (${sqlString(`ANON-L-${Date.now()}`)}, 'Anon Laundry Should Fail');
    `);

    expect(error).toContain("permission denied");
  });

  it("allows authenticated Laundry roles through Laundry RLS", () => {
    const output = runAuthenticatedSql(
      "ADMIN_LAUNDRY",
      `
      insert into public.laundry_units_of_measure (code, name)
      values (${sqlString(`AUTH-L-${Date.now()}`)}, 'Auth Laundry Should Pass')
      returning code;
    `
    );

    expect(output).toContain("AUTH-L-");
  });

  it("blocks authenticated CSSD roles from Laundry RLS", () => {
    const error = expectAuthenticatedFailure(
      "ADMIN_CSSD",
      `
      insert into public.laundry_units_of_measure (code, name)
      values (${sqlString(`CSSD-L-${Date.now()}`)}, 'CSSD Should Fail');
    `
    );

    expect(error).toContain("row-level security policy");
  });
});
