// FungiCode: fungi models
import { Command } from "commander";
import { printHeader } from "../../ui/terminal.js";

export function modelsCommand(): Command {
  return new Command("models")
    .description("List available model profiles and providers")
    .action(() => {
      printHeader("Models");
      const profiles = ["fast", "smart", "coder", "planner", "reviewer"];
      const providers = ["nine-router", "openai-compatible", "gemini", "deepseek"];
      console.log("\nProfiles:", profiles.join(", "));
      console.log("Providers:", providers.join(", "));
      console.log("\nStatus: placeholder — Sprint 1 will show live availability");
    });
}
