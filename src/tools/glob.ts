// FungiCode tool: glob — Sprint 0 placeholder
import type { Tool, ToolInput, ToolResult } from "./types.js";

export const globTool: Tool = {
  name: "glob",
  description: "TODO: implement glob — Sprint 1",
  riskLevel: "low",
  async execute(_input: ToolInput): Promise<ToolResult> {
    return { success: false, output: "", error: "glob not yet implemented — Sprint 1" };
  },
};
