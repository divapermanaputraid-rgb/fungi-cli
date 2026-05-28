export type ToolRiskLevel = "low" | "medium" | "high";
export type RiskLevel = ToolRiskLevel;

export type Tool<Input = any> = ToolDefinition<Input>;
export type ToolInput = Record<string, unknown>;

export interface ToolContext {
  cwd: string;
}

export interface ToolResult {
  ok: boolean;
  output: string;
  metadata?: Record<string, unknown>;
}

export interface ToolDefinition<Input = any> {
  name: string;
  description: string;
  riskLevel: ToolRiskLevel;
  isReadOnly: boolean;
  inputSchemaDescription: string;
  validate?(input: Input, context: ToolContext): ToolResult | null;
  execute(input: Input, context: ToolContext): Promise<ToolResult>;
}
