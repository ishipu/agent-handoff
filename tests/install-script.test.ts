import { execFile } from "node:child_process";
import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { promisify } from "node:util";
import assert from "node:assert/strict";

const execFileAsync = promisify(execFile);

test("install.sh installs the CLI into a temp npm prefix", { timeout: 120_000 }, async () => {
  const repoRoot = process.cwd();
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "agent-handoff-install-"));
  const prefix = path.join(tempRoot, "prefix");
  const cache = path.join(tempRoot, "cache");
  const env = {
    ...process.env,
    npm_config_prefix: prefix,
    npm_config_cache: cache,
    AGENT_HANDOFF_SKIP_DEPS: "1"
  };

  await execFileAsync("sh", ["install.sh"], {
    cwd: repoRoot,
    env,
    maxBuffer: 1024 * 1024 * 10
  });

  const bin = path.join(prefix, "bin", "agent-handoff");
  const { stdout } = await execFileAsync(bin, ["--help"], { env });
  assert.match(stdout, /agent-handoff/);
  assert.match(stdout, /close-session/);
});
