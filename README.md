# agent-handoff

Create a project-local handoff system for teams that switch between Claude Code and Codex.

## One-command install

macOS and Linux:

```sh
curl -fsSL https://raw.githubusercontent.com/ishipu/agent-handoff/main/install.sh | sh
```

From a local checkout:

```sh
sh ./install.sh
```

## One-command uninstall

macOS and Linux:

```sh
curl -fsSL https://raw.githubusercontent.com/ishipu/agent-handoff/main/uninstall.sh | sh
```

From a local checkout:

```sh
sh ./uninstall.sh
```

If npm global installs require a user-owned prefix:

```sh
npm_config_prefix="$HOME/.npm-global" sh ./install.sh
npm_config_prefix="$HOME/.npm-global" sh ./uninstall.sh
```

The installer requires Node.js 20 or newer, npm, and git when installing from the curl command. It builds the CLI and verifies that `agent-handoff --help` works. The uninstaller removes the global npm package and any stale executable in the active npm prefix.

## Development

```sh
npm install
npm test
```

During local development, run the CLI with:

```sh
node dist/src/cli.js --help
```

## Commands

```sh
agent-handoff init [projectPath] [--force]
agent-handoff status [projectPath]
agent-handoff pickup [projectPath]
agent-handoff files [projectPath]
agent-handoff close-session [projectPath] --agent claude --summary "What changed"
agent-handoff close-session [projectPath] --agent codex --summary "What changed"
```

## What `init` creates

```text
AGENTS.md
CLAUDE.md
.agent/
  HANDOFF.md
  sessions/
.claude/
  skills/
    agent-handoff/
      SKILL.md
.codex/
  skills/
    agent-handoff/
      SKILL.md
```

Existing files are preserved by default. Pass `--force` to replace scaffolded files.
