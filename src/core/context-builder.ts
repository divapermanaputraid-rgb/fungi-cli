import * as fs from "node:fs/promises";
import * as path from "node:path";
import { execSync } from "node:child_process";

export type PackageManager = "pnpm" | "npm" | "yarn" | "bun" | "unknown";

export interface ProjectContext {
  cwd: string;
  packageManager: PackageManager;
  projectType: string[];
  rootFiles: string[];
  treeSummary: string;
  gitStatus?: string;
  gitDiffSummary?: string;
  readmeSummary?: string;
  packageSummary?: {
    name?: string;
    scripts?: Record<string, string>;
    dependencies?: string[];
    devDependencies?: string[];
  };
  suggestedCommands?: {
    typecheck?: string;
    build?: string;
    test?: string;
  };
  safetyNotes: string[];
}

export interface ContextBuilderOptions {
  cwd: string;
  maxTreeEntries?: number;
  maxReadmeBytes?: number;
  maxGitBytes?: number;
}

const IGNORE_DIRS = new Set([
  "node_modules",
  "dist",
  ".git",
  ".needle",
  "coverage",
  ".next",
  "build"
]);

const IGNORE_FILES_EXACT = new Set([
  ".npmrc",
  ".pypirc"
]);

function isIgnored(name: string): boolean {
  if (IGNORE_DIRS.has(name) || IGNORE_FILES_EXACT.has(name)) {
    return true;
  }
  if (name.startsWith(".env") || name.endsWith(".pem") || name.endsWith(".key")) {
    return true;
  }
  return false;
}

export async function buildProjectContext(options: ContextBuilderOptions): Promise<ProjectContext> {
  const cwd = options.cwd;
  const ctx: ProjectContext = {
    cwd,
    packageManager: "unknown",
    projectType: [],
    rootFiles: [],
    treeSummary: "",
    safetyNotes: [
      "Never commit secrets, .env files, or private keys.",
      "Always verify destructive commands before running.",
      "Check generated code for security vulnerabilities."
    ]
  };

  try {
    const files = await fs.readdir(cwd, { withFileTypes: true });
    const rootFiles = files.filter(f => !isIgnored(f.name)).map(f => f.name);
    ctx.rootFiles = rootFiles;

    if (rootFiles.includes("pnpm-lock.yaml")) ctx.packageManager = "pnpm";
    else if (rootFiles.includes("package-lock.json")) ctx.packageManager = "npm";
    else if (rootFiles.includes("yarn.lock")) ctx.packageManager = "yarn";
    else if (rootFiles.includes("bun.lockb")) ctx.packageManager = "bun";
    
    // Quick tree summary (BFS or DFS, bounded)
    const tree: string[] = [];
    const maxEntries = options.maxTreeEntries || 100;
    
    async function buildTree(currentPath: string, relativePath: string) {
      if (tree.length >= maxEntries) return;
      
      try {
        const entries = await fs.readdir(currentPath, { withFileTypes: true });
        for (const entry of entries) {
          if (tree.length >= maxEntries) break;
          if (isIgnored(entry.name)) continue;
          
          const entryRelPath = relativePath ? `${relativePath}/${entry.name}` : entry.name;
          if (entry.isDirectory()) {
            tree.push(`${entryRelPath}/`);
            await buildTree(path.join(currentPath, entry.name), entryRelPath);
          } else {
            tree.push(entryRelPath);
          }
        }
      } catch (err) {
        // ignore dir read errors
      }
    }
    await buildTree(cwd, "");
    ctx.treeSummary = tree.join("\n");
    if (tree.length >= maxEntries) {
      ctx.treeSummary += "\n... (truncated)";
    }

    // Parse package.json
    try {
      const pkgRaw = await fs.readFile(path.join(cwd, "package.json"), "utf8");
      const pkg = JSON.parse(pkgRaw);
      
      const deps = Object.keys(pkg.dependencies || {});
      const devDeps = Object.keys(pkg.devDependencies || {});
      
      ctx.packageSummary = {
        name: pkg.name,
        scripts: pkg.scripts,
        dependencies: deps,
        devDependencies: devDeps
      };

      if (pkg.scripts) {
        ctx.suggestedCommands = {};
        const pm = ctx.packageManager === "unknown" ? "npm" : ctx.packageManager;
        const runPrefix = pm === "npm" ? "npm run " : `${pm} `;
        
        if (pkg.scripts.typecheck) ctx.suggestedCommands.typecheck = `${runPrefix}typecheck`;
        if (pkg.scripts.build) ctx.suggestedCommands.build = `${runPrefix}build`;
        if (pkg.scripts.test) ctx.suggestedCommands.test = `${runPrefix}test`;
      }

      // Project type detection based on deps and files
      if (rootFiles.includes("tsconfig.json") || devDeps.includes("typescript") || deps.includes("typescript")) {
        ctx.projectType.push("TypeScript");
      } else {
        ctx.projectType.push("JavaScript");
      }

      if (deps.includes("react") || devDeps.includes("react")) ctx.projectType.push("React");
      if (deps.includes("next")) ctx.projectType.push("Next.js");
      if (deps.includes("express")) ctx.projectType.push("Express");

    } catch (err) {
      // ignore package.json read/parse errors
    }

    // Fallback project type detection if package.json missed TS
    if (ctx.projectType.length === 0) {
      if (rootFiles.includes("tsconfig.json")) ctx.projectType.push("TypeScript");
    }

    // Python / Go / Rust additions for SPRINT_3B context
    if (rootFiles.includes("requirements.txt") || rootFiles.includes("pyproject.toml") || rootFiles.includes("setup.py")) {
      ctx.projectType.push("Python");
    }
    if (rootFiles.includes("go.mod")) {
      ctx.projectType.push("Go");
    }
    if (rootFiles.includes("Cargo.toml")) {
      ctx.projectType.push("Rust");
    }

    // Parse README.md
    let readmeName = rootFiles.find(f => f.toLowerCase() === "readme.md");
    if (readmeName) {
      try {
        const readmeContent = await fs.readFile(path.join(cwd, readmeName), "utf8");
        const maxLen = options.maxReadmeBytes || 2000;
        ctx.readmeSummary = readmeContent.slice(0, maxLen);
        if (readmeContent.length > maxLen) {
          ctx.readmeSummary += "\n... (truncated)";
        }
      } catch (err) {
        // ignore
      }
    }

    // Git info
    try {
      const maxGit = options.maxGitBytes || 2000;
      
      const statusOutput = execSync("git status --short", { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
      ctx.gitStatus = statusOutput.trim().slice(0, maxGit);
      if (statusOutput.length > maxGit) ctx.gitStatus += "\n... (truncated)";

      const diffOutput = execSync("git diff --stat", { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
      ctx.gitDiffSummary = diffOutput.trim().slice(0, maxGit);
      if (diffOutput.length > maxGit) ctx.gitDiffSummary += "\n... (truncated)";
    } catch (err) {
      // not a git repo or no git installed
    }

  } catch (err) {
    // Top-level failure (e.g. invalid cwd) - return what we have so far
  }

  return ctx;
}

export function formatProjectContextForPrompt(context: ProjectContext): string {
  let output = `Project Context:\nCWD: ${context.cwd}\nPackage Manager: ${context.packageManager}\n`;
  if (context.projectType.length > 0) {
    output += `Project Type: ${context.projectType.join(", ")}\n`;
  }
  
  if (context.packageSummary) {
    output += `\nPackage: ${context.packageSummary.name || "unnamed"}\n`;
    if (context.suggestedCommands) {
      output += `Suggested Commands:\n`;
      if (context.suggestedCommands.typecheck) output += `- typecheck: ${context.suggestedCommands.typecheck}\n`;
      if (context.suggestedCommands.build) output += `- build: ${context.suggestedCommands.build}\n`;
      if (context.suggestedCommands.test) output += `- test: ${context.suggestedCommands.test}\n`;
    }
  }

  if (context.treeSummary) {
    output += `\nFiles:\n${context.treeSummary}\n`;
  }

  if (context.gitStatus) {
    output += `\nGit Status:\n${context.gitStatus}\n`;
  }

  if (context.gitDiffSummary) {
    output += `\nGit Diff:\n${context.gitDiffSummary}\n`;
  }

  if (context.readmeSummary) {
    output += `\nREADME Summary:\n${context.readmeSummary}\n`;
  }

  if (context.safetyNotes.length > 0) {
    output += `\nSafety Notes:\n${context.safetyNotes.map(n => `- ${n}`).join("\n")}\n`;
  }

  return output.trim();
}