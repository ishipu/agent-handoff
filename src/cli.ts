#!/usr/bin/env node
import { runCli } from "./index.js";

runCli(process.argv.slice(2)).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`agent-handoff: ${message}`);
  process.exitCode = 1;
});
