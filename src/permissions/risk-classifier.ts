import type { RiskLevel } from "../tools/types.js";

export function classifyRisk(toolName: string, input: unknown): RiskLevel {
  // If no specific override, default to high risk to be safe
  switch (toolName) {
    case "file.read":
    case "glob":
    case "grep":
    case "git.diff":
      return "low"; // Read-only tools are generally low risk

    case "file.write":
    case "file.edit":
      return "medium"; // Local file modifications

    case "shell":
      // More advanced heuristic can go here if needed.
      // E.g. grep/ls -> low risk, rm/chmod -> high risk
      return "high";

    default:
      return "high";
  }
}
