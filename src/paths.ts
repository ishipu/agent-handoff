import path from "node:path";

export const expectedProjectFiles = [
  "AGENTS.md",
  "CLAUDE.md",
  ".agent/HANDOFF.md",
  ".claude/skills/agent-handoff/SKILL.md",
  ".codex/skills/agent-handoff/SKILL.md"
] as const;

export function resolveProjectPath(projectPath = "."): string {
  return path.resolve(process.cwd(), projectPath);
}

export function relativeDisplay(root: string, filePath: string): string {
  const relative = path.relative(root, filePath);
  return relative.length === 0 ? "." : relative.split(path.sep).join("/");
}
