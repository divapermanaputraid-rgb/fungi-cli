// Needle: needle plan
import { Command } from "commander";
import { printHeader, printError, printSuccess } from "../../ui/terminal.js";
import { runPlanMode } from "../../planner/plan-mode.js";
import type { ModelProfile } from "../../providers/types.js";

export function planCommand(): Command {
  return new Command("plan")
    .description("Enter structured plan mode")
    .argument("[task]", "task description")
    .option("--profile <profile>", "override the model profile")
    .option("--dry-run", "build prompt without calling provider")
    .action(async (task, options) => {
      printHeader("Plan Mode");
      
      const actualTask = task || "Default planning task"; // Keep it robust if no task is given, though typically requires one.
      
      console.log(`Task: ${actualTask}`);
      const profile = (options.profile as ModelProfile) || "planner";
      console.log(`Profile: ${profile}`);
      
      if (options.dryRun) {
        console.log("Mode: Dry Run (no API calls)");
      }
      
      console.log("\nBuilding project context...");

      const result = await runPlanMode({
        cwd: process.cwd(),
        task: actualTask,
        profile,
        dryRun: !!options.dryRun
      });

      if (!result.ok) {
        printError(`Plan generation failed: ${result.error}`);
        process.exit(1);
      }

      console.log("Context built.\n");
      printSuccess("Generated Plan:");
      console.log(result.plan);
    });
}