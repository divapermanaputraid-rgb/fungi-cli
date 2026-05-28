import type { RiskLevel } from "../tools/types.js";
import { ShellInput } from "../tools/shell.js";

const DANGEROUS_SHELL_OPERATORS = [
  /\|/,
  /&&/,
  /\|\|/,
  /;/,
  />/,
  />>/,
  /\$\(/,
  /`/
];

export function classifyRisk(toolName: string, input: unknown): RiskLevel {
  switch (toolName) {
    case "file.read":
    case "glob":
    case "grep":
    case "git.diff":
      return "low";

    case "file.write":
    case "file.edit":
      return "medium";

    case "shell":
      if (!input || typeof input !== "object" || !("command" in input)) {
        return "high";
      }

      const cmdStr = (input as ShellInput).command;

      // Automatically elevate risk for complex operators
      for (const op of DANGEROUS_SHELL_OPERATORS) {
        if (op.test(cmdStr)) {
          return "high";
        }
      }

      const cmdTokens = cmdStr.trim().split(/\s+/);
      const baseCommand = cmdTokens[0];

      if (["pwd", "ls", "pnpm", "npm", "git"].includes(baseCommand)) {
          if (["pwd", "ls"].includes(baseCommand)) {
              return "low";
          }
          if (baseCommand === "git") {
              if (cmdTokens.length > 1 && ["status", "diff"].includes(cmdTokens[1])) {
                  return "low";
              }
              if (cmdTokens.length > 1 && ["checkout", "restore"].includes(cmdTokens[1])) {
                  return "medium";
              }
          }
          if (["pnpm", "npm"].includes(baseCommand)) {
              if (cmdTokens.length > 1 && ["typecheck", "build", "test"].includes(cmdTokens[1])) {
                  return "low";
              }
              if (cmdTokens.length > 1 && cmdTokens[1] === "install") {
                  return "medium";
              }
          }
      }

      if (["mkdir", "touch"].includes(baseCommand)) {
          return "medium";
      }

      return "high";

    default:
      return "high";
  }
}