// FungiCode tool: file-read — Sprint 0 placeholder
import type { Tool, ToolInput, ToolResult } from "./types.js";

export const filereadTool: Tool = {
  name: "file-read",
  description: "TODO: implement file-read — Sprint 1",
  riskLevel: "low",
  async execute(_input: ToolInput): Promise<ToolResult> {
    return { success: false, output: "", error: "file-read not yet implemented — Sprint 1" };
  },
};
