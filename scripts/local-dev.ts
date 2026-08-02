import { spawn } from "node:child_process";

import { bootstrapDemoAuthUsers } from "./bootstrap-demo-auth";
import {
  getLocalDevCommandInvocation,
  getLocalDevCommandTimeoutMs,
} from "../src/lib/env/local-dev-command";
import {
  prepareLocalDev,
  startLocalDevQuick,
  stopLocalDev,
  type LocalDevRunner,
} from "../src/lib/env/local-dev-workflow";

function createRunner(): LocalDevRunner {
  return {
    run(command, args) {
      if (command === "bootstrap-demo-auth") {
        return bootstrapDemoAuthUsers()
          .then(() => ({ exitCode: 0, output: "NCIS demo auth users are ready." }))
          .catch((error) => ({
            exitCode: 1,
            output:
              error instanceof Error
                ? error.message
                : "Failed to bootstrap demo auth users.",
          }));
      }

      return new Promise((resolve) => {
        const invocation = getLocalDevCommandInvocation(command, args);
        const timeoutMs = getLocalDevCommandTimeoutMs(command);
        const child = spawn(invocation.command, invocation.args, {
          cwd: process.cwd(),
          env: process.env,
          shell: false,
        });

        let output = "";
        let settled = false;
        const timeoutId = setTimeout(() => {
          if (settled) {
            return;
          }

          settled = true;

          if (process.platform === "win32") {
            spawn("taskkill", ["/PID", String(child.pid), "/T", "/F"], {
              cwd: process.cwd(),
              env: process.env,
              shell: false,
            });
          } else {
            child.kill("SIGKILL");
          }

          resolve({
            exitCode: 1,
            output: `Command timed out after ${timeoutMs}ms: ${command} ${args.join(" ")}`,
          });
        }, timeoutMs);

        child.stdout.on("data", (chunk) => {
          const text = chunk.toString();
          output += text;
          process.stdout.write(text);
        });

        child.stderr.on("data", (chunk) => {
          const text = chunk.toString();
          output += text;
          process.stderr.write(text);
        });

        child.on("close", (code) => {
          if (settled) {
            return;
          }

          settled = true;
          clearTimeout(timeoutId);
          resolve({
            exitCode: code ?? 1,
            output,
          });
        });

        child.on("error", (error) => {
          if (settled) {
            return;
          }

          settled = true;
          clearTimeout(timeoutId);
          resolve({
            exitCode: 1,
            output: error.message,
          });
        });
      });
    },
    sleep(ms) {
      return new Promise((resolve) => {
        setTimeout(resolve, ms);
      });
    },
  };
}

async function main() {
  const action = process.argv[2] ?? "prepare";
  const runner = createRunner();

  if (action === "clean") {
    await stopLocalDev(runner);
    return;
  }

  if (action === "prepare") {
    await prepareLocalDev(runner);
    return;
  }

  if (action === "quick") {
    await startLocalDevQuick(runner);
    return;
  }

  throw new Error(`Unknown local dev action: ${action}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Local dev script failed.");
  process.exit(1);
});
