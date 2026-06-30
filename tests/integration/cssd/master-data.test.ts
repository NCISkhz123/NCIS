import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  cleanupTestDatabase,
  createMasterDataClient,
  createUnitOfMeasure,
  ensureTestDatabase,
  expectAnonFailure,
  expectAuthenticatedFailure,
  expectSqlFailure,
  runAuthenticatedSql,
  runSql,
  sqlString,
} from "./helpers/local-supabase";
import {
  archiveHospitalUnit,
  archiveUnitOfMeasure,
  createHospitalUnit,
  createItem,
  createUnitOfMeasure as createUnitOfMeasureRecord,
  updateHospitalUnit,
  updateItem,
  updateUnitOfMeasure,
} from "@/lib/cssd/services/master-data";

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

  it("blocks cssd writes when the auth user has no matching profile row", async () => {
    const claims = JSON.stringify({
      sub: "66666666-6666-6666-6666-666666666666",
      role: "authenticated",
    });

    const error = expectSqlFailure(`
      begin;
      set local role authenticated;
      set local "request.jwt.claims" = ${sqlString(claims)};
      insert into public.units_of_measure (code, name)
      values (${sqlString(`NOPROFILE-${Date.now()}`)}, 'No Profile Should Fail');
      rollback;
    `);

    expect(error).toContain("row-level security policy");
  });

  it("creates, updates, and archives satuan through the service", async () => {
    const client = createMasterDataClient("ADMIN_CSSD");
    const created = await createUnitOfMeasureRecord(client, {
      code: `PCS-${Date.now()}`,
      name: "Pieces Service",
    });

    expect(created.success).toBe(true);
    if (!created.success) {
      return;
    }

    const updated = await updateUnitOfMeasure(client, created.data.id, {
      code: created.data.code,
      name: "Pieces Updated",
      isActive: true,
    });

    expect(updated.success).toBe(true);
    if (!updated.success) {
      return;
    }

    expect(updated.data.name).toBe("Pieces Updated");

    const archived = await archiveUnitOfMeasure(client, created.data.id);

    expect(archived.success).toBe(true);
    if (!archived.success) {
      return;
    }

    expect(archived.data.is_active).toBe(false);
  }, 20_000);

  it("creates, updates, and archives unit through the service", async () => {
    const client = createMasterDataClient("ADMIN_CSSD");
    const created = await createHospitalUnit(client, {
      code: `ICU-${Date.now()}`,
      name: "ICU Service",
    });

    expect(created.success).toBe(true);
    if (!created.success) {
      return;
    }

    const updated = await updateHospitalUnit(client, created.data.id, {
      code: created.data.code,
      name: "ICU Updated",
      isActive: true,
    });

    expect(updated.success).toBe(true);
    if (!updated.success) {
      return;
    }

    expect(updated.data.name).toBe("ICU Updated");

    const archived = await archiveHospitalUnit(client, created.data.id);

    expect(archived.success).toBe(true);
    if (!archived.success) {
      return;
    }

    expect(archived.data.is_active).toBe(false);
  }, 20_000);

  it("auto-generates item code when blank", async () => {
    const client = createMasterDataClient("ADMIN_CSSD");
    const uomId = createUnitOfMeasure();

    const created = await createItem(client, {
      code: "",
      itemType: "REUSABLE",
      name: "Set Instrumen Auto",
      uomId,
    });

    expect(created.success).toBe(true);
    if (!created.success) {
      return;
    }

    expect(created.data.code).toMatch(/^CSSD-R-\d{4}$/);
  }, 20_000);

  it("preserves manual item code and supports update", async () => {
    const client = createMasterDataClient("ADMIN_CSSD");
    const uomId = createUnitOfMeasure();
    const manualCode = `MANUAL-${Date.now()}`;

    const created = await createItem(client, {
      code: manualCode,
      itemType: "CONSUMABLE_DISTRIBUTION",
      name: "Consumable Manual",
      uomId,
    });

    expect(created.success).toBe(true);
    if (!created.success) {
      return;
    }

    expect(created.data.code).toBe(manualCode);

    const updated = await updateItem(client, created.data.id, {
      code: manualCode,
      itemType: "CONSUMABLE_DISTRIBUTION",
      name: "Consumable Manual Updated",
      uomId,
      isActive: true,
    });

    expect(updated.success).toBe(true);
    if (!updated.success) {
      return;
    }

    expect(updated.data.code).toBe(manualCode);
    expect(updated.data.name).toBe("Consumable Manual Updated");
  }, 20_000);

  it("rejects duplicate active item codes", async () => {
    const client = createMasterDataClient("ADMIN_CSSD");
    const uomId = createUnitOfMeasure();
    const duplicateCode = `DUP-${Date.now()}`;

    const first = await createItem(client, {
      code: duplicateCode,
      itemType: "REUSABLE",
      name: "Item Pertama",
      uomId,
    });

    expect(first.success).toBe(true);

    const second = await createItem(client, {
      code: duplicateCode,
      itemType: "REUSABLE",
      name: "Item Kedua",
      uomId,
    });

    expect(second.success).toBe(false);
    if (!second.success) {
      expect(second.error).toContain("Kode item");
    }
  }, 20_000);
});
