import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  cleanupTestDatabase,
  ensureTestDatabase,
  expectAnonFailure,
  runAuthenticatedSql,
  runSql,
  sqlString,
} from "./cssd/helpers/local-supabase";

describe("Ambulance Database Schema & RLS", () => {
  beforeAll(() => {
    ensureTestDatabase();
  }, 90_000);

  afterAll(() => {
    cleanupTestDatabase();
  }, 90_000);

  it("creates ambulances table and permits insertion", () => {
    const ambulanceId = runSql(`
      insert into public.ambulances (name, plate_number, base_price_per_km)
      values ('Ambulance Alpha', 'B 1234 ABC', 15000)
      returning id;
    `);
    expect(ambulanceId).toBeTruthy();
  });

  it("creates ambulance_settings table and permits insertion", () => {
    const settingsId = runSql(`
      insert into public.ambulance_settings (hospital_lat, hospital_lng)
      values (-6.200000, 106.816666)
      returning id;
    `);
    expect(settingsId).toBeTruthy();
  });

  it("creates ambulance_transactions table with foreign key constraint", () => {
    const ambId = runSql(`
      insert into public.ambulances (name, plate_number, base_price_per_km)
      values ('Ambulance Beta', 'B 5678 XYZ', 20000)
      returning id;
    `);

    const txId = runSql(`
      insert into public.ambulance_transactions (ambulance_id, destination_lat, destination_lng, distance_km, total_cost)
      values (${sqlString(ambId)}, -6.210000, 106.820000, 12.5, 250000)
      returning id;
    `);
    expect(txId).toBeTruthy();
  });

  it("enforces foreign key constraint on ambulance_transactions", () => {
    const invalidId = "00000000-0000-0000-0000-000000000000";
    expect(() => {
      runSql(`
        insert into public.ambulance_transactions (ambulance_id, destination_lat, destination_lng, distance_km, total_cost)
        values (${sqlString(invalidId)}, -6.210000, 106.820000, 12.5, 250000);
      `);
    }).toThrow();
  });

  it("blocks unauthenticated (anon) access on ambulances", () => {
    const error = expectAnonFailure(`
      select * from public.ambulances;
    `);
    expect(error).toBeDefined();
  });

  it("allows authenticated users to query and insert via RLS", () => {
    const output = runAuthenticatedSql(
      "USER",
      `
      insert into public.ambulances (name, plate_number, base_price_per_km)
      values ('Ambulance Auth Test', 'B 9999 AUTH', 18000)
      returning name;
    `
    );
    expect(output).toContain("Ambulance Auth Test");
  });
});
