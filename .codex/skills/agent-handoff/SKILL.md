---
name: agent-handoff
description: Use when starting, resuming, picking up, or ending work in a repository shared by Claude Code and Codex. Reads .agent/HANDOFF.md and session notes so this agent can continue safely from prior agent sessions.
---

# Agent Handoff

Use this Skill when the user asks to continue, resume, pick up previous work, close a session, or coordinate between Claude and Codex.

## Start Or Resume

Before editing files:

1. Read AGENTS.md.
2. Read .agent/HANDOFF.md.
3. Inspect the newest .agent/sessions/*.md note if one exists.
4. Check `git status --short` and recent commits.
5. Identify unfinished work, touched files, blockers, tests run, and the next concrete action.

If another agent has uncommitted changes, work with them carefully and do not overwrite them without explicit user approval.

## Pickup Prompt

When asked to pick up work, prefer running:

```sh
agent-handoff pickup
```

Use the output as the working context, then inspect the repo before editing.

## End Session

Before ending, update the shared handoff:

```sh
agent-handoff close-session --agent codex --summary "What changed, tests run, blockers, and next step"
```

If the CLI is unavailable, manually update .agent/HANDOFF.md and add a timestamped note under .agent/sessions/.

## Invocation

Users may invoke this Skill directly with $agent-handoff, but also use it automatically whenever handoff or session continuity matters.
