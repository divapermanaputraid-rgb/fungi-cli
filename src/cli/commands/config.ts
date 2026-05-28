// FungiCode: fungi config
import { Command } from "commander";
import { printHeader } from "../../ui/terminal.js";

export function configCommand(): Command {
  const cmd = new Command("config").description("Manage FungiCode configuration");

  cmd
    .command("get <key>")
    .description("Get config value")
    .action((key) => {
      printHeader("Config");
      console.log(`Key: ${key} — TODO: read from .fungi/config.json — Sprint 1`);
    });

  cmd
    .command("set <key> <value>")
    .description("Set config value")
    .action((key, value) => {
      printHeader("Config");
      console.log(`Set: ${key}=${value} — TODO: write to .fungi/config.json — Sprint 1`);
    });

  return cmd;
}
