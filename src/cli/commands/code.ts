// Needle: needle code
import { Command } from "commander";
import { printHeader } from "../../ui/terminal.js";
import { loadNeedleConfig } from "../../config/loader.js";
import { createProviderRouter } from "../../providers/router.js";
import { runAgentLoop } from "../../core/agent-loop.js";
import type { ModelProfile } from "../../providers/types.js";

export function codeCommand(): Command {
  return new Command("code")
    .description("Run AI-assisted coding agent")
    .argument("<task>", "coding task")
    .option("-p, --profile <profile>", "model profile", "coder")
    .option("--max-iterations <number>", "max agent loop iterations", "8")
    .option("--dry-run", "dry run mode (does not execute tools)")
    .option("--plan-first", "placeholder for planning phase")
    .action(async (task, opts) => {
      printHeader("Code Mode");
      console.log(`Task: ${task}`);
      console.log(`Profile: ${opts.profile}`);
      
      const maxIter = parseInt(opts.maxIterations, 10);
      if (isNaN(maxIter)) {
        console.error("Error: --max-iterations must be a number");
        process.exit(1);
      }

      const cwd = process.cwd();
      const config = await loadNeedleConfig(cwd);
      const router = createProviderRouter(config);

      const providerChat = async (messages: any[]) => {
        return router.chatWithProfile({
          profile: opts.profile as ModelProfile,
          messages
        });
      };

      console.log(`Running Agent Loop (Max Iterations: ${maxIter})...`);
      
      const result = await runAgentLoop({
        cwd,
        task,
        profile: opts.profile as ModelProfile,
        maxIterations: maxIter,
        dryRun: opts.dryRun,
        providerChat
      });
      
      console.log("\n--- Agent Run Summary ---");
      console.log(`Success: ${result.ok}`);
      console.log(`Iterations: ${result.iterations}`);
      console.log("Summary: ", result.summary);
      console.log("\nTool Calls:");
      if (result.toolCalls.length === 0) {
        console.log("  (none)");
      } else {
        result.toolCalls.forEach((call, index) => {
          console.log(`  ${index + 1}. ${call.tool} [${call.ok ? "OK" : "FAILED"}]`);
        });
      }
    });
}