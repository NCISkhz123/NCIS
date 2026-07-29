export type LocalDevCommandInvocation = {
  command: string;
  args: string[];
};

const DEFAULT_LOCAL_DEV_COMMAND_TIMEOUT_MS = 90_000;
const SUPABASE_LOCAL_DEV_COMMAND_TIMEOUT_MS = 300_000;

function getExecutableCommand(command: string, args: string[]) {
  if (command === "supabase") {
    return ["npx", command, ...args];
  }

  return [command, ...args];
}

export function getLocalDevCommandInvocation(
  command: string,
  args: string[],
  platform = process.platform
): LocalDevCommandInvocation {
  const executableCommand = getExecutableCommand(command, args);

  if (platform === "win32") {
    return {
      command: "cmd.exe",
      args: ["/d", "/s", "/c", executableCommand.join(" ")],
    };
  }

  return {
    command: executableCommand[0],
    args: executableCommand.slice(1),
  };
}

export function getLocalDevCommandTimeoutMs(command: string) {
  if (command === "supabase") {
    return SUPABASE_LOCAL_DEV_COMMAND_TIMEOUT_MS;
  }

  return DEFAULT_LOCAL_DEV_COMMAND_TIMEOUT_MS;
}
