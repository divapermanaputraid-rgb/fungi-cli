import { readRecentSessions, SessionRecord, redactSessionText } from "../core/session.js";
import { 
  ProjectMemory, 
  readProjectMemory, 
  writeProjectMemoryAtomic,
  formatProjectMemory
} from "./project-memory.js";
import * as path from "node:path";

export interface ReflectOptions {
  cwd: string;
  limit?: number;
  dryRun?: boolean;
  force?: boolean;
}

export interface ReflectResult {
  ok: boolean;
  dryRun: boolean;
  sessionsRead: number;
  memoryPath: string;
  proposedMemory: string;
  summary: string;
}

function extractSnippets(text: string): string[] {
  if (!text) return [];
  const lines = text.split("\n");
  const snippets: string[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    // VERY simplistic extraction for V1 deterministic reflect:
    // Just grab lines that look like useful notes, avoiding obvious raw noise
    if (trimmed.length > 5 && trimmed.length < 150) {
      if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
        snippets.push(trimmed.substring(1).trim());
      } else if (trimmed.includes("decided") || trimmed.includes("agreed") || trimmed.includes("added")) {
        snippets.push(trimmed);
      }
    }
  }
  return snippets;
}

export function buildMemoryFromSessions(
  existing: ProjectMemory,
  sessions: SessionRecord[]
): ProjectMemory {
  // Deep clone existing memory (arrays)
  const nextMemory: ProjectMemory = {
    projectSummary: [...existing.projectSummary],
    architectureNotes: [...existing.architectureNotes],
    commands: [...existing.commands],
    conventions: [...existing.conventions],
    decisions: [...existing.decisions],
    recurringIssues: [...existing.recurringIssues],
    todo: [...existing.todo]
  };

  const addUnique = (arr: string[], item: string, maxItems: number = 30) => {
    const clean = redactSessionText(item).trim();
    if (!clean || clean.length < 5) return;
    if (!arr.includes(clean)) {
      arr.unshift(clean); // add to top
      if (arr.length > maxItems) {
        arr.pop(); // keep within limits
      }
    }
  };

  for (const session of sessions) {
    // Process based on mode
    if (session.mode === "plan") {
      addUnique(nextMemory.todo, `Planned task: ${session.task}`);
      const notes = extractSnippets(session.summary);
      for (const note of notes) {
        if (note.toLowerCase().includes("architect") || note.toLowerCase().includes("design")) {
          addUnique(nextMemory.architectureNotes, note);
        } else if (note.toLowerCase().includes("decid") || note.toLowerCase().includes("will use")) {
          addUnique(nextMemory.decisions, note);
        }
      }
    } else if (session.mode === "code") {
      addUnique(nextMemory.projectSummary, `Implemented: ${session.task}`);
      
      // Look for commands in tool calls
      if (session.toolCalls) {
        for (const tc of session.toolCalls) {
          if (tc.tool === "shell") {
            // Note: we don't have the raw command string in the basic SessionToolCallRecord,
            // but we can note that shell was used. A better approach would parse the command.
            // For now, extract commands from summary if they look like commands.
          }
        }
      }
      
      // Extract from summary
      const notes = extractSnippets(session.summary);
      for (const note of notes) {
        if (note.startsWith("npm ") || note.startsWith("pnpm ") || note.startsWith("yarn ") || note.startsWith("git ")) {
          addUnique(nextMemory.commands, note);
        } else if (note.toLowerCase().includes("convention") || note.toLowerCase().includes("pattern")) {
          addUnique(nextMemory.conventions, note);
        } else if (session.errors && session.errors.length > 0) {
          // If session had errors, maybe this note is about a fix
          addUnique(nextMemory.recurringIssues, `Encountered during ${session.task}: ${note}`);
        }
      }
    } else if (session.mode === "review") {
      const notes = extractSnippets(session.summary);
      for (const note of notes) {
        if (note.toLowerCase().includes("issue") || note.toLowerCase().includes("bug")) {
          addUnique(nextMemory.recurringIssues, note);
        } else if (note.toLowerCase().includes("refactor") || note.toLowerCase().includes("todo")) {
          addUnique(nextMemory.todo, note);
        }
      }
    }
    
    // Always check errors for recurring issues
    if (session.errors) {
      for (const error of session.errors) {
         // only take first line of error to avoid noise
         const firstLine = error.split('\n')[0];
         addUnique(nextMemory.recurringIssues, `Error: ${firstLine}`);
      }
    }
  }

  // Set last reflected
  nextMemory.lastReflected = new Date().toISOString();

  return nextMemory;
}

export async function runReflect(options: ReflectOptions): Promise<ReflectResult> {
  const limit = options.limit || 20;
  
  // Read sessions
  const sessions = await readRecentSessions(options.cwd, limit);
  
  if (sessions.length === 0) {
    return {
      ok: true,
      dryRun: !!options.dryRun,
      sessionsRead: 0,
      memoryPath: path.join(options.cwd, ".needle", "MEMORY.md"),
      proposedMemory: "",
      summary: "No sessions found. Nothing to reflect."
    };
  }

  // Read existing memory
  const existingMemory = await readProjectMemory(options.cwd);

  // Build new memory
  const nextMemory = buildMemoryFromSessions(existingMemory, sessions);
  
  // Format to string
  const formattedMemory = formatProjectMemory(nextMemory);
  const memoryPath = path.join(options.cwd, ".needle", "MEMORY.md");

  // Write if not dry-run
  if (!options.dryRun) {
    await writeProjectMemoryAtomic(options.cwd, nextMemory, { force: options.force });
  }

  return {
    ok: true,
    dryRun: !!options.dryRun,
    sessionsRead: sessions.length,
    memoryPath,
    proposedMemory: formattedMemory,
    summary: `Reflected over ${sessions.length} sessions and updated MEMORY.md.`
  };
}