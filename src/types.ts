export type AgentName = "claude" | "codex";

export interface InitOptions {
  projectPath?: string;
  force?: boolean;
}

export interface ProjectPathOptions {
  projectPath?: string;
}

export interface CloseSessionOptions extends ProjectPathOptions {
  agent: AgentName;
  summary: string;
  now?: Date;
}

export interface WriteResult {
  path: string;
  action: "created" | "preserved" | "updated";
}

export interface InitResult {
  projectPath: string;
  writes: WriteResult[];
  message: string;
}

export interface StatusReport {
  projectPath: string;
  missing: string[];
  text: string;
}

export interface CreatedFileEntry {
  path: string;
  type: "file" | "directory" | "session";
  exists: boolean;
}

export interface CreatedFilesReport {
  projectPath: string;
  entries: CreatedFileEntry[];
  text: string;
}

export interface CloseSessionResult {
  sessionPath: string;
  handoffPath: string;
  message: string;
}

export interface GitSnapshot {
  branch: string;
  status: string;
  recentCommit: string;
}
