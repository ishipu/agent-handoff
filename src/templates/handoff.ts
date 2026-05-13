export function initialHandoffTemplate(now = new Date()): string {
  return [
    "# Agent Handoff",
    "",
    `Last updated: ${now.toISOString()}`,
    "Last agent: none",
    "Current status: initialized",
    "",
    "## Current Goal",
    "",
    "No active goal recorded yet.",
    "",
    "## Latest Summary",
    "",
    "No sessions have been recorded yet.",
    "",
    "## Next Step",
    "",
    'Run `agent-handoff pickup` before starting. Before ending, run `agent-handoff close-session --agent claude --summary "..."` or `agent-handoff close-session --agent codex --summary "..."`.',
    "",
    "## Notes For Next Agent",
    "",
    "- Read AGENTS.md and this file first.",
    "- Review .agent/sessions/ for previous session notes.",
    "- Check git status before editing.",
    ""
  ].join("\n");
}

export function updatedHandoffTemplate(input: {
  agent: string;
  summary: string;
  timestamp: string;
  sessionRelativePath: string;
  branch: string;
  gitStatus: string;
  recentCommit: string;
}): string {
  const gitStatus = input.gitStatus.trim() || "clean";
  return [
    "# Agent Handoff",
    "",
    `Last updated: ${input.timestamp}`,
    `Last agent: ${input.agent}`,
    "Current status: ready for pickup",
    "",
    "## Latest Summary",
    "",
    input.summary,
    "",
    "## Next Step",
    "",
    `Read ${input.sessionRelativePath}, inspect the working tree, then continue from the latest unfinished item or ask the user if the next step is unclear.`,
    "",
    "## Git Snapshot",
    "",
    `- Branch: ${input.branch}`,
    `- Recent commit: ${input.recentCommit}`,
    "- Status:",
    "",
    "```text",
    gitStatus,
    "```",
    "",
    "## Notes For Next Agent",
    "",
    "- Read AGENTS.md before making changes.",
    "- Review the latest session note in .agent/sessions/.",
    "- Do not overwrite uncommitted changes from another agent without explicit user approval.",
    ""
  ].join("\n");
}
