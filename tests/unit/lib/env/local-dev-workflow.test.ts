import { describe, expect, it } from "vitest";

import {
  DEFAULT_LOCAL_DEV_WAIT_MS,
  prepareLocalDev,
  startLocalDevQuick,
  stopLocalDev,
} from "../../../../src/lib/env/local-dev-workflow";

function commandLine(command: string, args: string[]) {
  return [command, ...args].join(" ");
}

describe("prepareLocalDev", () => {
  it("retries transient Supabase startup failures before bootstrapping", async () => {
    const calls: string[] = [];
    const waits: number[] = [];
    const outputs = [
      { exitCode: 0, output: "abc123" },
      { exitCode: 0, output: "Stopped services: []" },
      { exitCode: 0, output: "" },
      { exitCode: 1, output: "supabase_db_ncis-cssd-mvp container is not ready: starting" },
      { exitCode: 0, output: "Started supabase local development setup." },
      { exitCode: 0, output: "NCIS demo auth users are ready." },
    ];

    await prepareLocalDev({
      run: async (command, args) => {
        calls.push(commandLine(command, args));
        const next = outputs.shift();

        if (!next) {
          throw new Error("Unexpected extra command");
        }

        return next;
      },
      sleep: async (ms) => {
        waits.push(ms);
      },
    });

    expect(calls).toEqual([
      "docker ps -aq --filter name=ncis-cssd-mvp",
      "supabase stop --project-id ncis-cssd-mvp --no-backup",
      "docker ps -aq --filter name=ncis-cssd-mvp",
      "supabase start -x realtime,storage-api,postgres-meta,studio,imgproxy,mailpit,vector,logflare,edge-runtime,supavisor",
      "supabase start -x realtime,storage-api,postgres-meta,studio,imgproxy,mailpit,vector,logflare,edge-runtime,supavisor",
      "bootstrap-demo-auth",
    ]);
    expect(waits).toEqual([DEFAULT_LOCAL_DEV_WAIT_MS]);
  });

  it("retries demo auth bootstrap while the local API is still warming up", async () => {
    const calls: string[] = [];
    const waits: number[] = [];
    const outputs = [
      { exitCode: 0, output: "" },
      { exitCode: 0, output: "Started supabase local development setup." },
      {
        exitCode: 1,
        output: "fetch failed\n[cause]: Error: connect ECONNREFUSED 127.0.0.1:55321",
      },
      { exitCode: 0, output: "NCIS demo auth users are ready." },
    ];

    await prepareLocalDev({
      run: async (command, args) => {
        calls.push(commandLine(command, args));
        const next = outputs.shift();

        if (!next) {
          throw new Error("Unexpected extra command");
        }

        return next;
      },
      sleep: async (ms) => {
        waits.push(ms);
      },
    });

    expect(calls).toEqual([
      "docker ps -aq --filter name=ncis-cssd-mvp",
      "supabase start -x realtime,storage-api,postgres-meta,studio,imgproxy,mailpit,vector,logflare,edge-runtime,supavisor",
      "bootstrap-demo-auth",
      "bootstrap-demo-auth",
    ]);
    expect(waits).toEqual([DEFAULT_LOCAL_DEV_WAIT_MS]);
  });

  it("starts the clean local stack before bootstrapping demo users", async () => {
    const calls: string[] = [];
    const outputs = [
      { exitCode: 0, output: "" },
      { exitCode: 0, output: "Started supabase local development setup." },
      { exitCode: 0, output: "NCIS demo auth users are ready." },
    ];

    await prepareLocalDev({
      run: async (command, args) => {
        calls.push(commandLine(command, args));
        const next = outputs.shift();

        if (!next) {
          throw new Error("Unexpected extra command");
        }

        return next;
      },
      sleep: async () => undefined,
    });

    expect(calls).toEqual([
      "docker ps -aq --filter name=ncis-cssd-mvp",
      "supabase start -x realtime,storage-api,postgres-meta,studio,imgproxy,mailpit,vector,logflare,edge-runtime,supavisor",
      "bootstrap-demo-auth",
    ]);
  });

  it("surfaces non transient failures without retrying forever", async () => {
    const calls: string[] = [];

    await expect(
      prepareLocalDev({
        run: async (command, args) => {
          calls.push(commandLine(command, args));

          if (calls.length === 1) {
            return {
              exitCode: 0,
              output: "abc123",
            };
          }

          return {
            exitCode: 1,
            output: "failed to connect to docker daemon",
          };
        },
        sleep: async () => undefined,
      })
    ).rejects.toThrow("failed to connect to docker daemon");

    expect(calls).toEqual([
      "docker ps -aq --filter name=ncis-cssd-mvp",
      "supabase stop --project-id ncis-cssd-mvp --no-backup",
    ]);
  });
});

describe("stopLocalDev", () => {
  it("skips Supabase stop when no local project containers exist", async () => {
    const calls: string[] = [];
    const outputs = [{ exitCode: 0, output: "" }];

    await stopLocalDev({
      run: async (command, args) => {
        calls.push(commandLine(command, args));
        const next = outputs.shift();

        if (!next) {
          throw new Error("Unexpected extra command");
        }

        return next;
      },
      sleep: async () => undefined,
    });

    expect(calls).toEqual(["docker ps -aq --filter name=ncis-cssd-mvp"]);
  });

  it("retries transient Docker prune conflicts while stopping the stack", async () => {
    const waits: number[] = [];
    const calls: string[] = [];
    const outputs = [
      { exitCode: 0, output: "abc123" },
      {
        exitCode: 1,
        output: "failed to prune volumes: Error response from daemon: a prune operation is already running",
      },
      { exitCode: 0, output: "Stopping containers..." },
      { exitCode: 0, output: "" },
    ];

    await stopLocalDev({
      run: async (command, args) => {
        calls.push(commandLine(command, args));
        const next = outputs.shift();

        if (!next) {
          throw new Error("Unexpected extra command");
        }

        return next;
      },
      sleep: async (ms) => {
        waits.push(ms);
      },
    });

    expect(calls).toEqual([
      "docker ps -aq --filter name=ncis-cssd-mvp",
      "supabase stop --project-id ncis-cssd-mvp --no-backup",
      "supabase stop --project-id ncis-cssd-mvp --no-backup",
      "docker ps -aq --filter name=ncis-cssd-mvp",
    ]);
    expect(waits).toEqual([DEFAULT_LOCAL_DEV_WAIT_MS]);
  });

  it("force removes stale project containers after Supabase stop reports success", async () => {
    const calls: string[] = [];
    const outputs = [
      { exitCode: 0, output: "abc123\nxyz789" },
      { exitCode: 0, output: "Stopped supabase local development setup." },
      { exitCode: 0, output: "abc123\nxyz789" },
      { exitCode: 0, output: "abc123\nxyz789" },
      { exitCode: 0, output: "" },
    ];

    await stopLocalDev({
      run: async (command, args) => {
        calls.push(commandLine(command, args));
        const next = outputs.shift();

        if (!next) {
          throw new Error("Unexpected extra command");
        }

        return next;
      },
      sleep: async () => undefined,
    });

    expect(calls).toEqual([
      "docker ps -aq --filter name=ncis-cssd-mvp",
      "supabase stop --project-id ncis-cssd-mvp --no-backup",
      "docker ps -aq --filter name=ncis-cssd-mvp",
      "docker rm -f abc123 xyz789",
      "docker ps -aq --filter name=ncis-cssd-mvp",
    ]);
  });
});

describe("startLocalDevQuick", () => {
  it("reuses an existing local stack and only bootstraps demo auth", async () => {
    const calls: string[] = [];
    const outputs = [
      { exitCode: 0, output: "abc123" },
      { exitCode: 0, output: "NCIS demo auth users are ready." },
    ];

    await startLocalDevQuick({
      run: async (command, args) => {
        calls.push(commandLine(command, args));
        const next = outputs.shift();

        if (!next) {
          throw new Error("Unexpected extra command");
        }

        return next;
      },
      sleep: async () => undefined,
    });

    expect(calls).toEqual([
      "docker ps -aq --filter name=ncis-cssd-mvp",
      "bootstrap-demo-auth",
    ]);
  });

  it("starts the local stack when needed before bootstrapping demo auth", async () => {
    const calls: string[] = [];
    const outputs = [
      { exitCode: 0, output: "" },
      { exitCode: 0, output: "Started supabase local development setup." },
      { exitCode: 0, output: "NCIS demo auth users are ready." },
    ];

    await startLocalDevQuick({
      run: async (command, args) => {
        calls.push(commandLine(command, args));
        const next = outputs.shift();

        if (!next) {
          throw new Error("Unexpected extra command");
        }

        return next;
      },
      sleep: async () => undefined,
    });

    expect(calls).toEqual([
      "docker ps -aq --filter name=ncis-cssd-mvp",
      "supabase start -x realtime,storage-api,postgres-meta,studio,imgproxy,mailpit,vector,logflare,edge-runtime,supavisor",
      "bootstrap-demo-auth",
    ]);
  });
});
