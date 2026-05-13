import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { GitSnapshot } from "./types.js";

const execFileAsync = promisify(execFile);

async function git(projectPath: string, args: string[]): Promise<string> {
  try {
    const { stdout } = await execFileAsync("git", args, {
      cwd: projectPath,
      windowsHide: true
    });
    return stdout.trimEnd();
  } catch {
    return "";
  }
}

export async function getGitSnapshot(projectPath: string): Promise<GitSnapshot> {
  const [branch, status, recentCommit] = await Promise.all([
    git(projectPath, ["branch", "--show-current"]),
    git(projectPath, ["status", "--short"]),
    git(projectPath, ["log", "--oneline", "-1"])
  ]);

  return {
    branch: branch || "unknown",
    status,
    recentCommit: recentCommit || "none"
  };
}
