import path from "node:path";

export const expectedProjectEntries = [
  { path: "AGENTS.md", type: "file" },
  { path: "CLAUDE.md", type: "file" },
  { path: ".agent/HANDOFF.md", type: "file" },
  { path: ".agent/sessions", type: "directory" },
  { path: ".claude/skills/agent-handoff/SKILL.md", type: "file" },
  { path: ".codex/skills/agent-handoff/SKILL.md", type: "file" }
] as const;

export const expectedProjectFiles = expectedProjectEntries
  .filter((entry) => entry.type === "file")
  .map((entry) => entry.path);

export function resolveProjectPath(projectPath = "."): string {
  return path.resolve(process.cwd(), projectPath);
}

export function relativeDisplay(root: string, filePath: string): string {
  const relative = path.relative(root, filePath);
  return relative.length === 0 ? "." : relative.split(path.sep).join("/");
}
