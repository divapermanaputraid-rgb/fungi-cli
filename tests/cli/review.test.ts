import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { reviewCommand } from "../../src/cli/commands/review.js";

describe("CLI: review", () => {
  test("command registers correctly", () => {
    const cmd = reviewCommand();
    assert.equal(cmd.name(), "review");
    assert.equal(cmd.description(), "AI-powered diff / code review");
    
    const options = cmd.options;
    assert.ok(options.find((o) => o.long === "--staged"));
    assert.ok(options.find((o) => o.long === "--profile"));
    assert.ok(options.find((o) => o.long === "--max-diff-bytes"));
  });
});