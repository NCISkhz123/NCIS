import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const projectRoot = process.cwd();

const serverActionFiles = [
  "src/app/(protected)/cssd/master-data/items/actions.ts",
  "src/app/(protected)/cssd/master-data/satuan/actions.ts",
  "src/app/(protected)/cssd/master-data/unit/actions.ts",
  "src/app/(protected)/cssd/pemasukan/actions.ts",
  "src/app/(protected)/cssd/distribusi/actions.ts",
  "src/app/(protected)/cssd/pemakaian-internal/actions.ts",
  "src/app/(protected)/cssd/pengembalian/actions.ts",
  "src/app/(protected)/cssd/stok-opname/actions.ts",
];

const masterDataActionFiles = serverActionFiles.filter((file) =>
  file.includes("/master-data/")
);

describe("CSSD server action modules", () => {
  it("only export async server actions from 'use server' files", () => {
    for (const relativePath of serverActionFiles) {
      const source = readFileSync(path.join(projectRoot, relativePath), "utf8");

      expect(source).toContain('"use server"');
      expect(source).not.toMatch(/export const initial\w+FormState/);
    }
  });

  it("guards master data actions with CSSD admin access", () => {
    for (const relativePath of masterDataActionFiles) {
      const source = readFileSync(path.join(projectRoot, relativePath), "utf8");

      expect(source).toContain("requireCssdAdminAccess");
      expect(source).not.toContain("requireCssdAccess");
    }
  });
});
