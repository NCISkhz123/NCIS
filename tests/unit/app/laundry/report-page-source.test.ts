import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const projectRoot = process.cwd();

const reportPages = [
  "src/app/(protected)/laundry/laporan/stok-status/page.tsx",
  "src/app/(protected)/laundry/laporan/riwayat-transaksi/page.tsx",
  "src/app/(protected)/laundry/laporan/kartu-stok/page.tsx",
] as const;

describe("laundry report pages", () => {
  it("do not hardcode silent row limits in page-level report queries", () => {
    for (const relativePath of reportPages) {
      const source = readFileSync(path.join(projectRoot, relativePath), "utf8");

      expect(source).not.toMatch(/limit:\s*\d+/);
    }
  });
});
