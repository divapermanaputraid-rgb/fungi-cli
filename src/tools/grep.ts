// FungiCode tool: grep — Sprint 0 placeholder
import type { Tool, ToolInput, ToolResult } from "./types.js";

export const grepTool: Tool = {
  name: "grep",
  description: "TODO: implement grep — Sprint 1",
  riskLevel: "low",
  async execute(_input: ToolInput): Promise<ToolResult> {
    return { success: false, output: "", error: "grep not yet implemented — Sprint 1" };
  },
};
