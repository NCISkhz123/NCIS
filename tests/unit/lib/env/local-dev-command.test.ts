import { describe, expect, it } from "vitest";

import {
  getLocalDevCommandInvocation,
  getLocalDevCommandTimeoutMs,
} from "../../../../src/lib/env/local-dev-command";

describe("getLocalDevCommandInvocation", () => {
  it("uses cmd.exe wrapping on Windows", () => {
    expect(
      getLocalDevCommandInvocation("supabase", ["start", "-x", "realtime,studio"], "win32")
    ).toEqual({
      command: "cmd.exe",
      args: ["/d", "/s", "/c", "npx supabase start -x realtime,studio"],
    });
  });

  it("runs docker directly instead of routing through npx on Windows", () => {
    expect(getLocalDevCommandInvocation("docker", ["ps", "-aq"], "win32")).toEqual({
      command: "cmd.exe",
      args: ["/d", "/s", "/c", "docker ps -aq"],
    });
  });

  it("uses npx directly on non Windows platforms", () => {
    expect(
      getLocalDevCommandInvocation("supabase", ["db", "reset"], "linux")
    ).toEqual({
      command: "npx",
      args: ["supabase", "db", "reset"],
    });
  });

  it("gives Supabase commands a longer timeout budget", () => {
    expect(getLocalDevCommandTimeoutMs("supabase")).toBe(300_000);
    expect(getLocalDevCommandTimeoutMs("docker")).toBe(90_000);
  });
});
