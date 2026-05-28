// FungiCode tool: file-write — Sprint 0 placeholder
import type { Tool, ToolInput, ToolResult } from "./types.js";

export const filewriteTool: Tool = {
  name: "file-write",
  description: "TODO: implement file-write — Sprint 1",
  riskLevel: "low",
  async execute(_input: ToolInput): Promise<ToolResult> {
    return { success: false, output: "", error: "file-write not yet implemented — Sprint 1" };
  },
};
