// Needle: needle review
import { Command } from "commander";
import { printHeader } from "../../ui/terminal.js";
import { loadNeedleConfig } from "../../config/loader.js";
import { createProviderRouter } from "../../providers/router.js";
import { runDiffReview } from "../../review/diff-reviewer.js";
import type { ModelProfile } from "../../providers/types.js";

export function reviewCommand(): Command {
  return new Command("review")
    .description("AI-powered diff / code review")
    .option("--staged", "review staged git changes", false)
    .option("--profile <profile>", "model profile to use", "reviewer")
    .option("--max-diff-bytes <number>", "max diff bytes", parseInt, 204800)
    .action(async (opts) => {
      printHeader("Review Mode");
      
      const config = await loadNeedleConfig(process.cwd());
      const router = createProviderRouter(config);
      
      const result = await runDiffReview({
        cwd: process.cwd(),
        staged: opts.staged,
        profile: opts.profile as ModelProfile,
        maxDiffBytes: opts.maxDiffBytes,
        providerChat: async (messages) => {
          return router.chatWithProfile({
            profile: opts.profile as ModelProfile,
            messages,
          });
        }
      });
      
      console.log(`Mode: ${result.staged ? "Staged" : "Unstaged"}`);
      console.log(`Profile: ${result.profile}`);
      console.log(`Diff Size: ${result.diffBytes} bytes`);
      console.log(`Truncated: ${result.truncated}`);
      console.log("\n" + result.review);
      
      if (!result.ok) {
        process.exit(1);
      }
    });
}
