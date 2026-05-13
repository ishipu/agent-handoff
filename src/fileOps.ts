import { access, mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import type { WriteResult } from "./types.js";

export async function exists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function readTextIfExists(filePath: string): Promise<string> {
  if (!(await exists(filePath))) {
    return "";
  }
  return readFile(filePath, "utf8");
}

export async function ensureDir(dirPath: string): Promise<void> {
  await mkdir(dirPath, { recursive: true });
}

export async function writeTextFile(
  filePath: string,
  content: string,
  force = false
): Promise<WriteResult> {
  await ensureDir(path.dirname(filePath));
  const fileExists = await exists(filePath);
  if (fileExists && !force) {
    return { path: filePath, action: "preserved" };
  }
  await writeFile(filePath, content, "utf8");
  return { path: filePath, action: fileExists ? "updated" : "created" };
}

export async function latestMarkdownFile(dirPath: string): Promise<string | undefined> {
  if (!(await exists(dirPath))) {
    return undefined;
  }
  const entries = await readdir(dirPath);
  const markdown = entries
    .filter((entry) => entry.endsWith(".md"))
    .sort((a, b) => b.localeCompare(a));
  return markdown[0] ? path.join(dirPath, markdown[0]) : undefined;
}

export async function listMarkdownFiles(dirPath: string): Promise<string[]> {
  if (!(await exists(dirPath))) {
    return [];
  }
  const entries = await readdir(dirPath);
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry);
    const info = await stat(fullPath);
    if (info.isFile() && entry.endsWith(".md")) {
      files.push(fullPath);
    }
  }
  return files.sort((a, b) => b.localeCompare(a));
}
