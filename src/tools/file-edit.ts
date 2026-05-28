// FungiCode tool: file-edit — Sprint 0 placeholder
import type { Tool, ToolInput, ToolResult } from "./types.js";

export const fileeditTool: Tool = {
  name: "file-edit",
  description: "TODO: implement file-edit — Sprint 1",
  riskLevel: "low",
  async execute(_input: ToolInput): Promise<ToolResult> {
    return { success: false, output: "", error: "file-edit not yet implemented — Sprint 1" };
  },
};
