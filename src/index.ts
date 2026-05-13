import { closeSession, createdFiles, initProject, pickupPrompt, projectStatus } from "./commands.js";
import { parseArgs, usage } from "./parseArgs.js";

export { closeSession, createdFiles, initProject, pickupPrompt, projectStatus, sessionFiles } from "./commands.js";
export type { CloseSessionOptions, CreatedFilesReport, InitOptions, StatusReport } from "./types.js";

export async function runCli(argv: string[]): Promise<void> {
  const parsed = parseArgs(argv);

  if (parsed.help || !parsed.command) {
    console.log(usage());
    return;
  }

  switch (parsed.command) {
    case "init": {
      const result = await initProject({
        projectPath: parsed.projectPath,
        force: parsed.flags.force === true
      });
      console.log(result.message);
      return;
    }
    case "status": {
      const report = await projectStatus({ projectPath: parsed.projectPath });
      console.log(report.text);
      return;
    }
    case "pickup": {
      const prompt = await pickupPrompt({ projectPath: parsed.projectPath });
      console.log(prompt);
      return;
    }
    case "files": {
      const report = await createdFiles({ projectPath: parsed.projectPath });
      console.log(report.text);
      return;
    }
    case "close-session": {
      const agent = parsed.flags.agent;
      const summary = parsed.flags.summary;
      if (agent !== "claude" && agent !== "codex") {
        throw new Error("close-session requires --agent claude or --agent codex");
      }
      if (typeof summary !== "string" || summary.trim().length === 0) {
        throw new Error('close-session requires --summary "..."');
      }
      const result = await closeSession({
        projectPath: parsed.projectPath,
        agent,
        summary
      });
      console.log(result.message);
      return;
    }
    default:
      throw new Error(`Unknown command: ${parsed.command}`);
  }
}
