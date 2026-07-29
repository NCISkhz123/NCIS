export const LOCAL_DEV_PROJECT_ID = "ncis-cssd-mvp";
export const LOCAL_DEV_SUPABASE_EXCLUDES = [
  "realtime",
  "storage-api",
  "postgres-meta",
  "studio",
  "imgproxy",
  "mailpit",
  "vector",
  "logflare",
  "edge-runtime",
  "supavisor",
] as const;
export const DEFAULT_LOCAL_DEV_WAIT_MS = 5_000;
const DEFAULT_MAX_ATTEMPTS = 4;

export type LocalDevCommandResult = {
  exitCode: number;
  output: string;
};

export type LocalDevRunner = {
  run: (command: string, args: string[]) => Promise<LocalDevCommandResult>;
  sleep: (ms: number) => Promise<void>;
};

const TRANSIENT_PATTERNS = [
  /container(?: .*?)? is not ready: starting/i,
  /removal of container .* is already in progress/i,
  /a prune operation is already running/i,
  /command timed out after \d+ms/i,
];
const TRANSIENT_BOOTSTRAP_PATTERNS = [/fetch failed/i, /ECONNREFUSED 127\.0\.0\.1:55321/i];

function isTransientFailure(output: string) {
  return TRANSIENT_PATTERNS.some((pattern) => pattern.test(output));
}

function isTransientBootstrapFailure(output: string) {
  return TRANSIENT_BOOTSTRAP_PATTERNS.some((pattern) => pattern.test(output));
}

function formatFailure(output: string, fallback: string) {
  const trimmed = output.trim();

  return trimmed.length > 0 ? trimmed : fallback;
}

async function listProjectContainers(runner: LocalDevRunner) {
  const listedContainers = await runner.run("docker", [
    "ps",
    "-aq",
    "--filter",
    `name=${LOCAL_DEV_PROJECT_ID}`,
  ]);

  return listedContainers.output
    .split(/\r?\n/)
    .map((value) => value.trim())
    .filter(Boolean);
}

async function runWithRetry(
  runner: LocalDevRunner,
  command: string,
  args: string[],
  fallbackError: string
) {
  for (let attempt = 1; attempt <= DEFAULT_MAX_ATTEMPTS; attempt += 1) {
    const result = await runner.run(command, args);

    if (result.exitCode === 0) {
      return result;
    }

    if (attempt < DEFAULT_MAX_ATTEMPTS && isTransientFailure(result.output)) {
      await runner.sleep(DEFAULT_LOCAL_DEV_WAIT_MS);
      continue;
    }

    throw new Error(formatFailure(result.output, fallbackError));
  }

  throw new Error(fallbackError);
}

async function runBootstrapWithRetry(runner: LocalDevRunner) {
  for (let attempt = 1; attempt <= DEFAULT_MAX_ATTEMPTS; attempt += 1) {
    const result = await runner.run("bootstrap-demo-auth", []);

    if (result.exitCode === 0) {
      return result;
    }

    if (attempt < DEFAULT_MAX_ATTEMPTS && isTransientBootstrapFailure(result.output)) {
      await runner.sleep(DEFAULT_LOCAL_DEV_WAIT_MS);
      continue;
    }

    throw new Error(
      formatFailure(result.output, "Failed to bootstrap NCIS demo auth users.")
    );
  }

  throw new Error("Failed to bootstrap NCIS demo auth users.");
}

async function removeStaleProjectContainers(runner: LocalDevRunner) {
  const containerIds = await listProjectContainers(runner);

  if (containerIds.length === 0) {
    return;
  }

  const removal = await runner.run("docker", ["rm", "-f", ...containerIds]);

  if (removal.exitCode !== 0) {
    throw new Error(
      formatFailure(removal.output, "Failed to remove stale local Supabase containers.")
    );
  }

  const remainingContainers = await listProjectContainers(runner);

  if (remainingContainers.length > 0) {
    throw new Error("Failed to fully clear stale local Supabase containers.");
  }
}

export async function stopLocalDev(runner: LocalDevRunner) {
  const existingContainers = await listProjectContainers(runner);

  if (existingContainers.length === 0) {
    return;
  }

  await runWithRetry(
    runner,
    "supabase",
    ["stop", "--project-id", LOCAL_DEV_PROJECT_ID, "--no-backup"],
    "Failed to stop local Supabase services."
  );
  await removeStaleProjectContainers(runner);
}

export async function prepareLocalDev(runner: LocalDevRunner) {
  await stopLocalDev(runner);
  await runWithRetry(
    runner,
    "supabase",
    ["start", "-x", LOCAL_DEV_SUPABASE_EXCLUDES.join(",")],
    "Failed to start local Supabase services."
  );

  await runBootstrapWithRetry(runner);
}

export async function startLocalDevQuick(runner: LocalDevRunner) {
  const existingContainers = await listProjectContainers(runner);

  if (existingContainers.length === 0) {
    await runWithRetry(
      runner,
      "supabase",
      ["start", "-x", LOCAL_DEV_SUPABASE_EXCLUDES.join(",")],
      "Failed to start local Supabase services."
    );
  }

  await runBootstrapWithRetry(runner);
}
