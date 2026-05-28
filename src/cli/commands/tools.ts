import { Command } from "commander";
import { createDefaultToolRegistry } from "../../tools/registry.js";
import { ToolContext } from "../../tools/types.js";

export const toolsCommand = new Command("tools")
  .description("Manage and execute FungiCode tools");

toolsCommand
  .command("list")
  .description("List available tools")
  .action(() => {
    const registry = createDefaultToolRegistry();
    const tools = registry.list();
    
    console.log("Available Tools:");
    for (const tool of tools) {
      console.log(`- ${tool.name}: ${tool.description}`);
      console.log(`  Risk: ${tool.riskLevel}, Read-only: ${tool.isReadOnly}`);
      console.log(`  Input schema: ${tool.inputSchemaDescription}`);
    }
  });

toolsCommand
  .command("run <name> [input]")
  .description("Run a tool with optional JSON input")
  .action(async (name: string, inputString?: string) => {
    const registry = createDefaultToolRegistry();
    
    let input: unknown = {};
    if (inputString) {
      try {
        input = JSON.parse(inputString);
      } catch (e) {
        console.error("Error: Input must be valid JSON.");
        process.exit(1);
      }
    }

    const context: ToolContext = {
      cwd: process.cwd(),
    };

    try {
      const result = await registry.execute(name, input, context);
      
      if (!result.ok) {
        console.error("Tool execution failed:");
        console.error(result.output);
        process.exit(1);
      }

      console.log(result.output);
      if (result.metadata) {
        console.log("\nMetadata:", JSON.stringify(result.metadata, null, 2));
      }
    } catch (e) {
      console.error(e instanceof Error ? e.message : String(e));
      process.exit(1);
    }
  });