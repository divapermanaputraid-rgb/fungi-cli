import { Command } from "commander";
import { runReflect } from "../../memory/reflector.js";
import { print, printError } from "../../ui/terminal.js";

export function reflectCommand(): Command {
  const cmd = new Command("reflect")
    .description("Reflect on recent sessions and update project memory")
    .option("--limit <number>", "Number of recent sessions to analyze", "20")
    .option("--dry-run", "Print proposed memory update without writing to disk")
    .option("--force", "Override existing memory lock if present")
    .option("--llm", "Placeholder: LLM-assisted reflect is not implemented yet. Use deterministic reflect or wait for Sprint 8C.")
    .action(async (options) => {
      try {
        if (options.llm) {
          print("LLM-assisted reflect is not implemented yet. Use deterministic reflect or wait for Sprint 8C.");
          return;
        }

        const limit = parseInt(options.limit, 10);
        if (isNaN(limit) || limit <= 0) {
          throw new Error("Invalid limit. Must be a positive integer.");
        }

        const cwd = process.cwd();

        const result = await runReflect({
          cwd,
          limit,
          dryRun: options.dryRun,
          force: options.force,
        });

        if (result.sessionsRead === 0) {
          print(result.summary);
          return;
        }

        if (result.dryRun) {
          print(`\n[DRY RUN] Proposed memory update based on ${result.sessionsRead} sessions:\n`);
          console.log(result.proposedMemory);
        } else {
          print(result.summary);
        }

      } catch (error: any) {
        printError(`Reflect failed: ${error.message}`);
        process.exit(1);
      }
    });
  
  return cmd;
}