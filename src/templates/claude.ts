export function claudeTemplate(): string {
  return [
    "@AGENTS.md",
    "",
    "# Claude Code Notes",
    "",
    "Use the agent-handoff Skill when starting, resuming, or ending work in this repository.",
    "",
    "Before ending a session, update the shared handoff with:",
    "",
    "```sh",
    "agent-handoff close-session --agent claude --summary \"What changed, tests run, blockers, and next step\"",
    "```",
    ""
  ].join("\n");
}
