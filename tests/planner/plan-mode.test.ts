import { test, describe } from "node:test";
import * as assert from "node:assert/strict";
import { runPlanMode } from "../../src/planner/plan-mode.js";

import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";

describe("Plan Mode", () => {
  let dummyCwd: string;

  test.beforeEach(async () => {
    dummyCwd = await fs.mkdtemp(path.join(os.tmpdir(), "needle-plan-test-"));
    await fs.mkdir(path.join(dummyCwd, ".needle"));
    await fs.writeFile(path.join(dummyCwd, ".needle", "config.json"), JSON.stringify({}));
  });

  test.afterEach(async () => {
    await fs.rm(dummyCwd, { recursive: true, force: true });
  });

  test("builds context and prompt, defaults to planner profile", async () => {
    let receivedMessages: any[] = [];
    const result = await runPlanMode({
      cwd: dummyCwd,
      task: "add login form",
      providerChat: async (messages) => {
        receivedMessages = messages;
        return {
          content: "Goal: add login\nRisks: none\nTest plan: run tests\nSuggested next command: needle code \"add login form\" --plan-first",
          model: "mock",
          provider: "openrouter"
        };
      }
    });

    assert.equal(result.ok, true);
    assert.equal(result.profile, "planner");
    assert.equal(result.usedProvider, false);
    assert.ok(result.plan.includes("Goal: add login"));
    assert.ok(result.plan.includes("Risks: none"));
    assert.ok(result.plan.includes("Test plan: run tests"));
    assert.ok(result.plan.includes("Suggested next command: needle code \"add login form\" --plan-first"));
    
    assert.equal(receivedMessages.length, 2);
    assert.equal(receivedMessages[0].role, "system");
    assert.ok(receivedMessages[0].content.includes("This is plan-only"));
    assert.equal(receivedMessages[1].role, "user");
    assert.ok(receivedMessages[1].content.includes("add login form"));
  });

  test("dry-run skips provider", async () => {
    let providerCalled = false;
    const result = await runPlanMode({
      cwd: dummyCwd,
      task: "add login form",
      dryRun: true,
      providerChat: async (messages) => {
        providerCalled = true;
        return {
          content: "Mock plan",
          model: "mock",
          provider: "openrouter"
        };
      }
    });

    assert.equal(result.ok, true);
    assert.equal(result.profile, "planner");
    assert.equal(result.usedProvider, false);
    assert.equal(providerCalled, false);
    assert.ok(result.plan.includes("Dry run"));
  });

  test("handles missing provider/invalid key cleanly", async () => {
    // In actual implementation without dryRun and without providerChat,
    // it will try to resolve keys from env. If not present, router throws.
    // We simulate this by providing a providerChat that throws, or by not providing it and relying on env.
    const result = await runPlanMode({
      cwd: dummyCwd,
      task: "add login form",
      providerChat: async () => {
        throw new Error("Missing API key. Set NINE_ROUTER_API_KEY.");
      }
    });

    assert.equal(result.ok, false);
    assert.equal(result.error, "Missing API key. Set NINE_ROUTER_API_KEY.");
    assert.equal(result.plan, "");
  });
});