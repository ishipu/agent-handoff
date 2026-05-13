import { execFile } from "node:child_process";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { promisify } from "node:util";
import assert from "node:assert/strict";
import { closeSession, initProject, pickupPrompt, projectStatus, sessionFiles } from "../src/index.js";
import { exists } from "../src/fileOps.js";

const execFileAsync = promisify(execFile);

async function tempProject(): Promise<string> {
  return mkdtemp(path.join(os.tmpdir(), "agent-handoff-test-"));
}

test("init creates the expected project tree", async () => {
  const project = await tempProject();
  const result = await initProject({ projectPath: project });

  assert.equal(result.writes.filter((write) => write.action === "created").length, 5);
  await Promise.all([
    assertExists(path.join(project, "AGENTS.md")),
    assertExists(path.join(project, "CLAUDE.md")),
    assertExists(path.join(project, ".agent/HANDOFF.md")),
    assertExists(path.join(project, ".agent/sessions")),
    assertExists(path.join(project, ".claude/skills/agent-handoff/SKILL.md")),
    assertExists(path.join(project, ".codex/skills/agent-handoff/SKILL.md"))
  ]);
});

test("init preserves existing files unless force is set", async () => {
  const project = await tempProject();
  await writeFile(path.join(project, "AGENTS.md"), "custom agents", "utf8");
  await writeFile(path.join(project, "CLAUDE.md"), "custom claude", "utf8");

  const result = await initProject({ projectPath: project });
  assert.equal(result.writes.filter((write) => write.action === "preserved").length, 2);
  assert.equal(await readFile(path.join(project, "AGENTS.md"), "utf8"), "custom agents");
  assert.equal(await readFile(path.join(project, "CLAUDE.md"), "utf8"), "custom claude");

  await initProject({ projectPath: project, force: true });
  assert.match(await readFile(path.join(project, "AGENTS.md"), "utf8"), /Agent Instructions/);
});

test("status reports missing setup and complete setup", async () => {
  const project = await tempProject();
  const missing = await projectStatus({ projectPath: project });
  assert.match(missing.text, /Setup: missing items/);
  assert.ok(missing.missing.includes("AGENTS.md"));

  await initProject({ projectPath: project });
  const complete = await projectStatus({ projectPath: project });
  assert.match(complete.text, /Setup: complete/);
  assert.equal(complete.missing.length, 0);
});

test("status reports dirty git state", async () => {
  const project = await tempProject();
  await execFileAsync("git", ["init"], { cwd: project });
  await initProject({ projectPath: project });
  await writeFile(path.join(project, "work-in-progress.txt"), "dirty", "utf8");

  const dirty = await projectStatus({ projectPath: project });
  assert.match(dirty.text, /Changed files: [1-9]/);
  assert.match(dirty.text, /Branch:/);
});

test("pickup includes handoff context and continuation guidance", async () => {
  const project = await tempProject();
  await initProject({ projectPath: project });
  const prompt = await pickupPrompt({ projectPath: project });

  assert.match(prompt, /Continue this project from the shared agent handoff/);
  assert.match(prompt, /Read AGENTS.md/);
  assert.match(prompt, /Current handoff/);
});

test("close-session writes a session note and updates handoff", async () => {
  const project = await tempProject();
  await initProject({ projectPath: project });
  const result = await closeSession({
    projectPath: project,
    agent: "codex",
    summary: "Implemented the first pass and ran tests.",
    now: new Date("2026-05-13T12:00:00.000Z")
  });

  assert.match(result.message, /Recorded codex session/);
  const sessions = await sessionFiles(project);
  assert.equal(sessions.length, 1);
  assert.match(await readFile(sessions[0], "utf8"), /Implemented the first pass/);
  assert.match(await readFile(path.join(project, ".agent/HANDOFF.md"), "utf8"), /Last agent: codex/);
});

async function assertExists(filePath: string): Promise<void> {
  assert.equal(await exists(filePath), true, `${filePath} should exist`);
}
