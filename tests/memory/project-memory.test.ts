import test from "node:test";
import * as assert from "node:assert/strict";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";

import {
  createEmptyProjectMemory,
  formatProjectMemory,
  parseProjectMemory,
  writeProjectMemoryAtomic,
  readProjectMemory
} from "../../src/memory/project-memory.js";

test("Project Memory - createEmptyProjectMemory has required sections", () => {
  const mem = createEmptyProjectMemory();
  assert.ok(Array.isArray(mem.projectSummary));
  assert.ok(Array.isArray(mem.architectureNotes));
  assert.ok(Array.isArray(mem.commands));
  assert.ok(Array.isArray(mem.conventions));
  assert.ok(Array.isArray(mem.decisions));
  assert.ok(Array.isArray(mem.recurringIssues));
  assert.ok(Array.isArray(mem.todo));
  assert.equal(mem.lastReflected, undefined);
});

test("Project Memory - formatProjectMemory includes all headings", () => {
  const mem = createEmptyProjectMemory();
  const formatted = formatProjectMemory(mem);
  
  assert.match(formatted, /# Needle Project Memory/);
  assert.match(formatted, /## Project Summary/);
  assert.match(formatted, /## Architecture Notes/);
  assert.match(formatted, /## Commands/);
  assert.match(formatted, /## Conventions/);
  assert.match(formatted, /## Decisions/);
  assert.match(formatted, /## Recurring Issues/);
  assert.match(formatted, /## TODO/);
  assert.match(formatted, /## Last Reflected/);
});

test("Project Memory - parseProjectMemory round-trips basic content", () => {
  const mem = createEmptyProjectMemory();
  mem.projectSummary.push("Test Summary");
  mem.architectureNotes.push("Test Arch");
  mem.commands.push("npm run test");
  mem.conventions.push("Use strict");
  mem.decisions.push("No DB");
  mem.recurringIssues.push("Flaky tests");
  mem.todo.push("Fix things");
  mem.lastReflected = "2024-01-01T00:00:00.000Z";

  const formatted = formatProjectMemory(mem);
  const parsed = parseProjectMemory(formatted);

  assert.deepEqual(parsed.projectSummary, mem.projectSummary);
  assert.deepEqual(parsed.architectureNotes, mem.architectureNotes);
  assert.deepEqual(parsed.commands, mem.commands);
  assert.deepEqual(parsed.conventions, mem.conventions);
  assert.deepEqual(parsed.decisions, mem.decisions);
  assert.deepEqual(parsed.recurringIssues, mem.recurringIssues);
  assert.deepEqual(parsed.todo, mem.todo);
  assert.equal(parsed.lastReflected, mem.lastReflected);
});

test("Project Memory - File operations and locking", async (t) => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "needle-mem-test-"));
  
  await t.test("writeProjectMemoryAtomic creates .needle/MEMORY.md", async () => {
    const mem = createEmptyProjectMemory();
    mem.projectSummary.push("First Summary");
    
    await writeProjectMemoryAtomic(tmpDir, mem);
    
    const memPath = path.join(tmpDir, ".needle", "MEMORY.md");
    const stat = await fs.stat(memPath);
    assert.ok(stat.isFile());
    
    const readMem = await readProjectMemory(tmpDir);
    assert.equal(readMem.projectSummary[0], "First Summary");
  });

  await t.test("lock prevents write unless force", async () => {
    const lockPath = path.join(tmpDir, ".needle", "MEMORY.lock");
    await fs.writeFile(lockPath, "locked", "utf8");
    
    const mem = createEmptyProjectMemory();
    
    // Should fail without force
    await assert.rejects(
      writeProjectMemoryAtomic(tmpDir, mem),
      /MEMORY\.md is locked/
    );
    
    // Should succeed with force
    mem.projectSummary.push("Forced Summary");
    await writeProjectMemoryAtomic(tmpDir, mem, { force: true });
    
    const readMem = await readProjectMemory(tmpDir);
    assert.equal(readMem.projectSummary[0], "Forced Summary");
    
    // Lock should be cleaned up
    try {
      await fs.stat(lockPath);
      assert.fail("Lock file should have been deleted");
    } catch (e: any) {
      assert.equal(e.code, "ENOENT");
    }
  });

  await fs.rm(tmpDir, { recursive: true, force: true });
});

test("Project Memory - no secrets appear in formatted memory", () => {
  const mem = createEmptyProjectMemory();
  mem.projectSummary.push("Added API key: sk-ant-api03-abcdef1234567890");
  mem.todo.push("Token bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9");
  
  const formatted = formatProjectMemory(mem);
  
  // Should have redacted the secrets
  assert.doesNotMatch(formatted, /sk-ant-api03-abcdef1234567890/);
  assert.doesNotMatch(formatted, /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9/);
  assert.match(formatted, /\*\*\*/);
});
