import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { appendSessionRecord, readRecentSessions, redactSessionText, SessionRecord } from "../../src/core/session.js";

test("session logging", async (t) => {
  const setupTempDir = async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "needle-session-test-"));
    return tempDir;
  };

  await t.test("appendSessionRecord creates .needle/sessions/runs.jsonl and reads newest first", async () => {
    const cwd = await setupTempDir();
    
    const record1: SessionRecord = {
      id: "run_1",
      createdAt: new Date("2024-01-01T10:00:00Z").toISOString(),
      mode: "code",
      task: "first task",
      cwd,
      status: "success",
      durationMs: 100,
      summary: "First summary",
    };

    const record2: SessionRecord = {
      id: "run_2",
      createdAt: new Date("2024-01-01T11:00:00Z").toISOString(),
      mode: "plan",
      task: "second task",
      cwd,
      status: "failure",
      durationMs: 200,
      summary: "Second summary",
    };

    await appendSessionRecord(cwd, record1);
    await appendSessionRecord(cwd, record2);

    const logPath = path.join(cwd, ".needle", "sessions", "runs.jsonl");
    const exists = await fs.access(logPath).then(() => true).catch(() => false);
    assert.ok(exists, "runs.jsonl should be created");

    const sessions = await readRecentSessions(cwd);
    assert.equal(sessions.length, 2);
    // Should be newest first
    assert.equal(sessions[0].id, "run_2");
    assert.equal(sessions[1].id, "run_1");
  });

  await t.test("malformed JSONL lines are ignored", async () => {
    const cwd = await setupTempDir();
    const logPath = path.join(cwd, ".needle", "sessions", "runs.jsonl");
    await fs.mkdir(path.dirname(logPath), { recursive: true });

    // Write a valid, then malformed, then valid
    await fs.writeFile(logPath, [
      JSON.stringify({ id: "run_1", mode: "plan", createdAt: new Date("2024-01-01T10:00:00Z").toISOString() }),
      "NOT A JSON LINE",
      "{ malformed json }",
      JSON.stringify({ id: "run_2", mode: "code", createdAt: new Date("2024-01-01T11:00:00Z").toISOString() }),
    ].join("\n") + "\n");

    const sessions = await readRecentSessions(cwd);
    assert.equal(sessions.length, 2);
    assert.equal(sessions[0].id, "run_2");
    assert.equal(sessions[1].id, "run_1");
  });

  await t.test("redactSessionText removes API-key-like values", async () => {
    const input = "Here is my key: sk-ant-api03-1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef and a bearer token: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xyz";
    const redacted = redactSessionText(input);
    
    assert.ok(!redacted.includes("sk-ant-api03-"), "Anthropic key should be redacted");
    assert.ok(!redacted.includes("Bearer eyJhbGci"), "Bearer token should be redacted");
    assert.ok(redacted.includes("***"));
  });

  await t.test("appendSessionRecord bounds long summaries", async () => {
    const cwd = await setupTempDir();
    
    const longSummary = "a".repeat(10 * 1024); // 10KB
    const record: SessionRecord = {
      id: "run_1",
      createdAt: new Date().toISOString(),
      mode: "code",
      task: "task",
      cwd,
      status: "success",
      durationMs: 100,
      summary: longSummary,
    };

    await appendSessionRecord(cwd, record);
    
    const sessions = await readRecentSessions(cwd);
    assert.equal(sessions.length, 1);
    assert.ok(sessions[0].summary.length <= 8 * 1024 + 100, "Summary should be truncated to ~8KB");
    assert.ok(sessions[0].summary.includes("(truncated)"));
  });

  await t.test("session logging failure does not break caller", async () => {
    const cwd = await setupTempDir();
    
    // Make the directory read-only so logging fails
    const dirPath = path.join(cwd, ".needle", "sessions");
    await fs.mkdir(dirPath, { recursive: true });
    await fs.chmod(dirPath, 0o444);

    const record: SessionRecord = {
      id: "run_1",
      createdAt: new Date().toISOString(),
      mode: "code",
      task: "task",
      cwd,
      status: "success",
      durationMs: 100,
      summary: "summary",
    };

    // Should not throw
    await assert.doesNotReject(async () => {
      await appendSessionRecord(cwd, record);
    });
    
    // Cleanup so it can be deleted
    await fs.chmod(dirPath, 0o755);
  });
});