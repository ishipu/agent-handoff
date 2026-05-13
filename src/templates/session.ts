export function sessionTemplate(input: {
  agent: string;
  summary: string;
  timestamp: string;
  branch: string;
  gitStatus: string;
  recentCommit: string;
}): string {
  const gitStatus = input.gitStatus.trim() || "clean";
  return [
    "# Agent Session",
    "",
    `- Agent: ${input.agent}`,
    `- Ended: ${input.timestamp}`,
    `- Branch: ${input.branch}`,
    `- Recent commit: ${input.recentCommit}`,
    "",
    "## Summary",
    "",
    input.summary,
    "",
    "## Git Status",
    "",
    "```text",
    gitStatus,
    "```",
    "",
    "## Pickup Guidance",
    "",
    "The next agent should read .agent/HANDOFF.md, review this note, inspect git status, and continue from the latest unfinished task.",
    ""
  ].join("\n");
}
