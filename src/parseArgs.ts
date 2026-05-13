export interface ParsedArgs {
  command?: string;
  projectPath?: string;
  flags: Record<string, string | boolean>;
  help: boolean;
}

export function parseArgs(argv: string[]): ParsedArgs {
  const flags: Record<string, string | boolean> = {};
  const positional: string[] = [];
  let help = false;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "-h" || arg === "--help") {
      help = true;
      continue;
    }
    if (arg.startsWith("--")) {
      const [rawName, inlineValue] = arg.slice(2).split(/=(.*)/s, 2);
      if (!rawName) {
        throw new Error(`Invalid flag: ${arg}`);
      }
      if (inlineValue !== undefined) {
        flags[rawName] = inlineValue;
        continue;
      }
      const next = argv[index + 1];
      if (next && !next.startsWith("--")) {
        flags[rawName] = next;
        index += 1;
      } else {
        flags[rawName] = true;
      }
      continue;
    }
    positional.push(arg);
  }

  return {
    command: positional[0],
    projectPath: positional[1],
    flags,
    help
  };
}

export function usage(): string {
  return `agent-handoff

Usage:
  agent-handoff init [projectPath] [--force]
  agent-handoff status [projectPath]
  agent-handoff pickup [projectPath]
  agent-handoff files [projectPath]
  agent-handoff close-session [projectPath] --agent <claude or codex> --summary "What changed"

Examples:
  agent-handoff close-session --agent claude --summary "Finished the auth refactor"
  agent-handoff close-session --agent codex --summary "Added tests and left one blocker"

Commands:
  init           Create project-local handoff files and Claude/Codex Skills.
  status         Show handoff setup, git status, and the latest session note.
  pickup         Print a ready-to-paste continuation prompt.
  files          List scaffolded handoff files and session notes.
  close-session  Record a session note and refresh .agent/HANDOFF.md.
`;
}
