import { test, describe } from "node:test";
import * as assert from "node:assert/strict";
import { planCommand } from "../../src/cli/commands/plan.js";

describe("CLI Plan Command", () => {
  test("plan command can be imported and registered", () => {
    const cmd = planCommand();
    assert.equal(cmd.name(), "plan");
    assert.equal(cmd.description(), "Enter structured plan mode");
  });
});