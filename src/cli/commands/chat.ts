// FungiCode: fungi chat
import { Command } from "commander";
import { printHeader } from "../../ui/terminal.js";

export function chatCommand(): Command {
  return new Command("chat")
    .description("Start an interactive AI chat session")
    .option("-p, --profile <profile>", "model profile", "smart")
    .action((opts) => {
      printHeader("Chat Mode");
      console.log(`Profile: ${opts.profile}`);
      console.log("Status: placeholder");
      console.log("Next: provider router + agent loop — Sprint 1");
    });
}
