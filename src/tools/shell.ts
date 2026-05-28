// FungiCode tool: shell — Sprint 0 placeholder
import type { Tool, ToolInput, ToolResult } from "./types.js";

export const shellTool: Tool = {
  name: "shell",
  description: "TODO: implement shell — Sprint 1",
  riskLevel: "low",
  async execute(_input: ToolInput): Promise<ToolResult> {
    return { success: false, output: "", error: "shell not yet implemented — Sprint 1" };
  },
};
