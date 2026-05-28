// FungiCode tool: git-diff — Sprint 0 placeholder
import type { Tool, ToolInput, ToolResult } from "./types.js";

export const gitdiffTool: Tool = {
  name: "git-diff",
  description: "TODO: implement git-diff — Sprint 1",
  riskLevel: "low",
  async execute(_input: ToolInput): Promise<ToolResult> {
    return { success: false, output: "", error: "git-diff not yet implemented — Sprint 1" };
  },
};
