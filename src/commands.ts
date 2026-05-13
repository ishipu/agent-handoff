import path from "node:path";
import { ensureDir, exists, latestMarkdownFile, listMarkdownFiles, readTextIfExists, writeTextFile } from "./fileOps.js";
import { getGitSnapshot } from "./git.js";
import { expectedProjectFiles, relativeDisplay, resolveProjectPath } from "./paths.js";
import {
  agentsTemplate,
  claudeTemplate,
  initialHandoffTemplate,
  sessionTemplate,
  skillTemplate,
  updatedHandoffTemplate
} from "./templates/index.js";
import type { CloseSessionOptions, CloseSessionResult, InitOptions, InitResult, ProjectPathOptions, StatusReport, WriteResult } from "./types.js";

const SESSION_DIR = ".agent/sessions";
const HANDOFF_PATH = ".agent/HANDOFF.md";

export async function initProject(options: InitOptions = {}): Promise<InitResult> {
  const projectPath = resolveProjectPath(options.projectPath);
  const force = options.force ?? false;
  await ensureDir(path.join(projectPath, SESSION_DIR));

  const writes: WriteResult[] = [];
  writes.push(
    await writeTextFile(path.join(projectPath, "AGENTS.md"), agentsTemplate(), force),
    await writeTextFile(path.join(projectPath, "CLAUDE.md"), claudeTemplate(), force),
    await writeTextFile(path.join(projectPath, HANDOFF_PATH), initialHandoffTemplate(), force),
    await writeTextFile(path.join(projectPath, ".claude/skills/agent-handoff/SKILL.md"), skillTemplate("claude"), force),
    await writeTextFile(path.join(projectPath, ".codex/skills/agent-handoff/SKILL.md"), skillTemplate("codex"), force)
  );

  const counts = countWrites(writes);
  return {
    projectPath,
    writes,
    message: [
      `Initialized agent handoff in ${projectPath}`,
      `Created: ${counts.created}, updated: ${counts.updated}, preserved: ${counts.preserved}`
    ].join("\n")
  };
}

export async function projectStatus(options: ProjectPathOptions = {}): Promise<StatusReport> {
  const projectPath = resolveProjectPath(options.projectPath);
  const missing = await missingSetup(projectPath);
  const git = await getGitSnapshot(projectPath);
  const handoffPath = path.join(projectPath, HANDOFF_PATH);
  const handoff = (await readTextIfExists(handoffPath)).trim() || "No .agent/HANDOFF.md found.";
  const latestSessionPath = await latestMarkdownFile(path.join(projectPath, SESSION_DIR));
  const latestSession = latestSessionPath
    ? (await readTextIfExists(latestSessionPath)).trim()
    : "No session notes found.";

  const statusLines = git.status.trim() ? git.status.trim().split("\n").length : 0;
  const text = [
    "Agent Handoff Status",
    `Project: ${projectPath}`,
    `Setup: ${missing.length === 0 ? "complete" : "missing items"}`,
    missing.length > 0 ? ["Missing:", ...missing.map((item) => `- ${item}`)].join("\n") : "",
    "Git:",
    `- Branch: ${git.branch}`,
    `- Recent commit: ${git.recentCommit}`,
    `- Changed files: ${statusLines}`,
    "",
    "Current handoff:",
    fence(handoff),
    "",
    "Latest session:",
    latestSessionPath ? `Path: ${relativeDisplay(projectPath, latestSessionPath)}\n${fence(latestSession)}` : latestSession
  ].filter(Boolean).join("\n");

  return { projectPath, missing, text };
}

export async function pickupPrompt(options: ProjectPathOptions = {}): Promise<string> {
  const projectPath = resolveProjectPath(options.projectPath);
  const git = await getGitSnapshot(projectPath);
  const handoff = (await readTextIfExists(path.join(projectPath, HANDOFF_PATH))).trim() || "No .agent/HANDOFF.md found.";
  const latestSessionPath = await latestMarkdownFile(path.join(projectPath, SESSION_DIR));
  const latestSession = latestSessionPath
    ? (await readTextIfExists(latestSessionPath)).trim()
    : "No session notes found.";

  return [
    "Continue this project from the shared agent handoff.",
    "",
    `Project: ${projectPath}`,
    "",
    "Before editing:",
    "1. Read AGENTS.md.",
    "2. Read .agent/HANDOFF.md.",
    "3. Inspect .agent/sessions/ and git status.",
    "4. Preserve any uncommitted work from another agent.",
    "",
    "Git snapshot:",
    `- Branch: ${git.branch}`,
    `- Recent commit: ${git.recentCommit}`,
    `- Status: ${git.status.trim() || "clean"}`,
    "",
    "Current handoff:",
    fence(handoff),
    "",
    "Latest session note:",
    latestSessionPath ? `Path: ${relativeDisplay(projectPath, latestSessionPath)}\n${fence(latestSession)}` : latestSession,
    "",
    "Continue from the next concrete step. If the handoff is unclear, ask the user before changing files."
  ].join("\n");
}

export async function closeSession(options: CloseSessionOptions): Promise<CloseSessionResult> {
  const projectPath = resolveProjectPath(options.projectPath);
  const now = options.now ?? new Date();
  const timestamp = now.toISOString();
  const safeTimestamp = timestamp.replace(/[:.]/g, "-");
  const sessionDir = path.join(projectPath, SESSION_DIR);
  await ensureDir(sessionDir);

  const git = await getGitSnapshot(projectPath);
  const sessionPath = path.join(sessionDir, `${safeTimestamp}-${options.agent}.md`);
  const sessionContent = sessionTemplate({
    agent: options.agent,
    summary: options.summary.trim(),
    timestamp,
    branch: git.branch,
    gitStatus: git.status,
    recentCommit: git.recentCommit
  });
  await writeTextFile(sessionPath, sessionContent, true);

  const handoffPath = path.join(projectPath, HANDOFF_PATH);
  const handoffContent = updatedHandoffTemplate({
    agent: options.agent,
    summary: options.summary.trim(),
    timestamp,
    sessionRelativePath: relativeDisplay(projectPath, sessionPath),
    branch: git.branch,
    gitStatus: git.status,
    recentCommit: git.recentCommit
  });
  await writeTextFile(handoffPath, handoffContent, true);

  return {
    sessionPath,
    handoffPath,
    message: [
      `Recorded ${options.agent} session: ${relativeDisplay(projectPath, sessionPath)}`,
      `Updated handoff: ${relativeDisplay(projectPath, handoffPath)}`
    ].join("\n")
  };
}

async function missingSetup(projectPath: string): Promise<string[]> {
  const missing: string[] = [];
  for (const expected of expectedProjectFiles) {
    if (!(await exists(path.join(projectPath, expected)))) {
      missing.push(expected);
    }
  }
  if (!(await exists(path.join(projectPath, SESSION_DIR)))) {
    missing.push(SESSION_DIR);
  }
  return missing;
}

function countWrites(writes: WriteResult[]): Record<WriteResult["action"], number> {
  return writes.reduce(
    (counts, write) => {
      counts[write.action] += 1;
      return counts;
    },
    { created: 0, preserved: 0, updated: 0 }
  );
}

function fence(content: string): string {
  return ["````md", content, "````"].join("\n");
}

export async function sessionFiles(projectPathInput = "."): Promise<string[]> {
  const projectPath = resolveProjectPath(projectPathInput);
  return listMarkdownFiles(path.join(projectPath, SESSION_DIR));
}
