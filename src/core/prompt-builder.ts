import type { ProjectContext } from "./context-builder.js";
import { formatProjectContextForPrompt } from "./context-builder.js";
import type { ToolDefinition } from "../tools/types.js";

export interface AgentPromptInput {
  task: string;
  projectContext: ProjectContext;
  tools: ToolDefinition[];
}

export function buildAgentSystemPrompt(input: AgentPromptInput): string {
  const ctx = formatProjectContextForPrompt(input.projectContext);

  const toolsStr = input.tools.map(t => {
    return `- ${t.name} (Risk: ${t.riskLevel}, Read-Only: ${t.isReadOnly})
  Description: ${t.description}
  Input Schema: ${t.inputSchemaDescription}`;
  }).join("\n\n");

  return `You are Needle, a precise and capable AI coding agent.

Your goal is to complete the user's task using the available tools.
You must respond with valid JSON ONLY. No markdown formatting, no code blocks around the JSON, and no other text.

PROTOCOL
Respond with exactly one of these JSON formats:

1. To use a tool:
{ "type": "tool_call", "tool": "tool-name", "input": { ... }, "reason": "why you are calling this tool" }

2. To finish the task:
{ "type": "final", "summary": "what you did", "nextSteps": ["step 1", "step 2"] }

AVAILABLE TOOLS
${toolsStr}

PROJECT CONTEXT
${ctx}

Respond ONLY in the JSON protocol format.`;
}

export function buildAgentUserPrompt(task: string): string {
  return `Task: ${task}\n\nPlease proceed using the JSON protocol.`;
}

export interface PlannerPromptInput {
  task: string;
  projectContext: ProjectContext;
}

export function buildPlannerSystemPrompt(input: PlannerPromptInput): string {
  const ctx = formatProjectContextForPrompt(input.projectContext);

  return `You are Needle, an expert Software Architect and Planner.
Your task is to analyze the user's request and project context to create a detailed implementation plan.

RULES:
- This is plan-only.
- Do not modify files.
- Do not request tool execution.
- Do not include secrets.
- Keep output concise and actionable.

OUTPUT FORMAT:
Return a structured implementation plan in Markdown with exactly these headings:

# Goal
[Brief restatement of the user's objective]

# Understanding
[Key project context relevant to the task]

# Likely files
[Files expected to be inspected or changed]

# Proposed steps
[Sequential implementation steps]

# Risks
[Potential side-effects, security concerns, or architectural risks]

# Test plan
[How to verify the changes]

# Questions or assumptions
[Any ambiguities the user should clarify]

# Suggested next command
needle code "${input.task}" --plan-first

PROJECT CONTEXT:
${ctx}`;
}

export function buildPlannerUserPrompt(task: string): string {
  return `Task: ${task}\n\nPlease provide the implementation plan.`;
}
