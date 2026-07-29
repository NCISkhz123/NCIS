import { loadEnvConfig } from "@next/env";

export function loadNextEnv(projectDir = process.cwd()) {
  loadEnvConfig(projectDir, process.env.NODE_ENV !== "production", console, true);
}
