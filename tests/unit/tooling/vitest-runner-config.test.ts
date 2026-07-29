import { readFileSync } from "node:fs";
import path from "node:path";

import nextConfig from "../../../next.config";
import vitestConfig from "../../../vitest.config";
import { describe, expect, it } from "vitest";

const workspaceRoot = path.resolve(__dirname, "../../..");
const packageJsonPath = path.join(workspaceRoot, "package.json");

function readPackageScripts() {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8")) as {
    scripts?: Record<string, string>;
  };

  return packageJson.scripts ?? {};
}

describe("vitest local runner defaults", () => {
  it("uses a single-worker threads pool for unit tests on slower local filesystems", () => {
    expect(vitestConfig.test?.pool).toBe("threads");
    expect(vitestConfig.test?.fileParallelism).toBe(false);
    expect(vitestConfig.test?.maxWorkers).toBe(1);
  });

  it("keeps a compatibility script for the slower serial fallback", () => {
    const scripts = readPackageScripts();

    expect(scripts["test:unit"]).toContain("--pool=threads");
    expect(scripts["test:unit"]).toContain("--no-file-parallelism");
    expect(scripts["test:unit"]).toContain("--maxWorkers=1");
    expect(scripts["test:unit:compat"]).toContain("--pool=forks");
    expect(scripts["test:unit:compat"]).toContain("--no-file-parallelism");
    expect(scripts["test:unit:compat"]).toContain("--maxWorkers=1");
  });

  it("exposes a lighter local dev workflow for daily app startup", () => {
    const scripts = readPackageScripts();

    expect(scripts[".local:quick"]).toBe("tsx scripts/local-dev.ts quick");
    expect(scripts["local:start"]).toBe("npm run .local:quick");
    expect(scripts["local:app"]).toBe("npm run dev");
    expect(scripts["local:quick"]).toBe("npm run local:start && npm run local:app");
  });

  it("enables Next.js dev filesystem caching for faster local rebuilds", () => {
    expect(nextConfig.experimental?.turbopackFileSystemCacheForDev).toBe(true);
  });
});
