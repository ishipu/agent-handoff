# Agent Instructions

This project uses agent handoff files so Claude Code and Codex can continue each other's work safely.

## Start Of Work

Before editing files:

1. Read .agent/HANDOFF.md.
2. Review the latest files in .agent/sessions/.
3. Check git status and recent commits.
4. Identify any uncommitted work from another agent before making changes.

## End Of Work

Before ending a session:

1. Summarize what changed.
2. Record tests or checks run.
3. Name blockers and the next concrete step.
4. Run agent-handoff close-session with the correct --agent value.

Never overwrite another agent's uncommitted changes without explicit user approval.
