import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const projectRoot = process.cwd();

const serverActionFiles = [
  "src/app/(protected)/laundry/master-data/items/actions.ts",
  "src/app/(protected)/laundry/master-data/satuan/actions.ts",
  "src/app/(protected)/laundry/master-data/unit/actions.ts",
  "src/app/(protected)/laundry/pemasukan/actions.ts",
  "src/app/(protected)/laundry/distribusi/actions.ts",
  "src/app/(protected)/laundry/pemakaian-internal/actions.ts",
  "src/app/(protected)/laundry/pengembalian/actions.ts",
  "src/app/(protected)/laundry/stok-opname/actions.ts",
] as const;

const masterDataActionFiles = serverActionFiles.filter((file) =>
  file.includes("/master-data/")
);

describe("Laundry server action modules", () => {
  it("only export async server actions from 'use server' files", () => {
    for (const relativePath of serverActionFiles) {
      const source = readFileSync(path.join(projectRoot, relativePath), "utf8");

      expect(source).toContain('"use server"');
      expect(source).not.toMatch(/export const initial\w+FormState/);
    }
  });

  it("guards master data actions with Laundry admin access", () => {
    for (const relativePath of masterDataActionFiles) {
      const source = readFileSync(path.join(projectRoot, relativePath), "utf8");

      expect(source).toContain("requireLaundryAdminAccess");
      expect(source).not.toContain("requireLaundryAccess");
    }
  });
});
