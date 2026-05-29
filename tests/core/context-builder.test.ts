import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";
import { execSync } from "node:child_process";
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { buildProjectContext, formatProjectContextForPrompt } from "../../src/core/context-builder";

let tempDir: string;

before(async () => {
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "needle-ctx-test-"));

  // Create mock files
  await fs.writeFile(path.join(tempDir, "pnpm-lock.yaml"), "");
  await fs.writeFile(
    path.join(tempDir, "package.json"),
    JSON.stringify({
      name: "test-pkg",
      scripts: {
        build: "tsc",
        test: "bun test",
        typecheck: "tsc --noEmit",
      },
      dependencies: {
        react: "^18.0.0",
      },
      devDependencies: {
        typescript: "^5.0.0",
      },
    })
  );
  await fs.writeFile(path.join(tempDir, "README.md"), "Hello World");

  // Create ignored dirs/files
  await fs.mkdir(path.join(tempDir, "node_modules"));
  await fs.writeFile(path.join(tempDir, "node_modules", "ignoreme.js"), "");
  await fs.mkdir(path.join(tempDir, "dist"));
  await fs.writeFile(path.join(tempDir, "dist", "out.js"), "");
  await fs.writeFile(path.join(tempDir, ".env"), "SECRET=123");

  // Setup basic git repo so git commands don't fail, but we won't strictly assert git diff since it might vary locally
  try {
    execSync("git init", { cwd: tempDir, stdio: "ignore" });
    execSync("git add package.json", { cwd: tempDir, stdio: "ignore" });
  } catch (e) {
    // Ignore if git fails
  }
});

after(async () => {
  await fs.rm(tempDir, { recursive: true, force: true });
});

test("detects pnpm from pnpm-lock.yaml", async () => {
  const ctx = await buildProjectContext({ cwd: tempDir });
  assert.equal(ctx.packageManager, "pnpm");
});

test("reads package scripts and dependencies", async () => {
  const ctx = await buildProjectContext({ cwd: tempDir });
  assert.equal(ctx.packageSummary?.name, "test-pkg");
  assert.ok(ctx.packageSummary?.dependencies?.includes("react"));
  assert.ok(ctx.packageSummary?.devDependencies?.includes("typescript"));
});

test("suggests typecheck/build/test commands", async () => {
  const ctx = await buildProjectContext({ cwd: tempDir });
  assert.equal(ctx.suggestedCommands?.build, "pnpm build");
  assert.equal(ctx.suggestedCommands?.test, "pnpm test");
  assert.equal(ctx.suggestedCommands?.typecheck, "pnpm typecheck");
});

test("ignores node_modules and dist", async () => {
  const ctx = await buildProjectContext({ cwd: tempDir });
  assert.ok(!ctx.treeSummary.includes("node_modules"));
  assert.ok(!ctx.treeSummary.includes("dist"));
  assert.ok(ctx.treeSummary.includes("package.json"));
});

test("does not read .env", async () => {
  const ctx = await buildProjectContext({ cwd: tempDir });
  assert.ok(!ctx.treeSummary.includes(".env"));
});

test("missing README does not fail", async () => {
  const emptyDir = await fs.mkdtemp(path.join(os.tmpdir(), "needle-ctx-empty-"));
  const ctx = await buildProjectContext({ cwd: emptyDir });
  assert.equal(ctx.readmeSummary, undefined);
  assert.equal(ctx.treeSummary, "");
  await fs.rm(emptyDir, { recursive: true, force: true });
});

test("formatProjectContextForPrompt returns compact Needle context text", async () => {
  const ctx = await buildProjectContext({ cwd: tempDir });
  const text = formatProjectContextForPrompt(ctx);
  assert.ok(text.includes("Project Context:"));
  assert.ok(text.includes("Package Manager: pnpm"));
  assert.ok(text.includes("Project Type: React, Node.js, TypeScript"));
  assert.ok(text.includes("Suggested Commands:"));
  assert.ok(text.includes("- build: pnpm build"));
  assert.ok(text.includes("README Summary:\nHello World"));
  assert.ok(text.includes("Safety Notes:"));
});

test("detects bun from bun.lock", async () => {
  const bunDir = await fs.mkdtemp(path.join(os.tmpdir(), "needle-ctx-bun-"));
  await fs.writeFile(path.join(bunDir, "bun.lock"), "");
  const ctx = await buildProjectContext({ cwd: bunDir });
  assert.equal(ctx.packageManager, "bun");
  await fs.rm(bunDir, { recursive: true, force: true });
});
