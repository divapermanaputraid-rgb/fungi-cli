// FungiCode Tool Types — Sprint 0 interfaces

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface ToolInput {
  [key: string]: unknown;
}

export interface ToolResult {
  success: boolean;
  output: string;
  error?: string;
}

export interface Tool {
  name: string;
  description: string;
  riskLevel: RiskLevel;
  execute(input: ToolInput): Promise<ToolResult>;
}