// FungiCode: fungi init
import { Command } from "commander";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { printHeader } from "../../ui/terminal.js";

const MEMORY_MD = `# FungiCode Project Memory

This file stores durable project context for FungiCode.

Rules:
- Do not store secrets.
- Do not store API keys.
- Store technical decisions, project conventions, and architectural notes.
- Keep this file concise.
`;

const CONFIG_JSON = {
  defaultProvider: "nine-router",
  models: { fast: "", smart: "", coder: "", planner: "", reviewer: "" },
  permissions: { mode: "ask" },
};

export function initCommand(): Command {
  return new Command("init")
    .description("Initialize FungiCode in the current project")
    .action(() => {
      printHeader("Init");
      const root = join(process.cwd(), ".fungi");
      const dirs = [root, join(root, "sessions"), join(root, "cache")];

      for (const d of dirs) {
        if (!existsSync(d)) {
          mkdirSync(d, { recursive: true });
          console.log(`Created: ${d}`);
        } else {
          console.log(`Exists:  ${d}`);
        }
      }

      const memPath = join(root, "MEMORY.md");
      if (!existsSync(memPath)) {
        writeFileSync(memPath, MEMORY_MD, "utf8");
        console.log(`Created: ${memPath}`);
      }

      const cfgPath = join(root, "config.json");
      if (!existsSync(cfgPath)) {
        writeFileSync(cfgPath, JSON.stringify(CONFIG_JSON, null, 2), "utf8");
        console.log(`Created: ${cfgPath}`);
      }

      console.log("\n✅ FungiCode initialized. Edit .fungi/config.json to set your provider and models.");
    });
}
