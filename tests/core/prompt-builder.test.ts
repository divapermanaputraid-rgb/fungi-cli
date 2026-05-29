import test from "node:test";
import assert from "node:assert/strict";
import { buildAgentSystemPrompt, buildAgentUserPrompt, type AgentPromptInput } from "../../src/core/prompt-builder.js";
import type { ProjectContext } from "../../src/core/context-builder.js";
import type { ToolDefinition } from "../../src/tools/types.js";

test("buildAgentSystemPrompt includes Needle identity", () => {
  const ctx: ProjectContext = {
    cwd: "/test",
    packageManager: "npm",
    projectType: ["Node.js"],
    rootFiles: [],
    treeSummary: "",
    safetyNotes: []
  };

  const input: AgentPromptInput = {
    task: "do something",
    projectContext: ctx,
    tools: []
  };

  const prompt = buildAgentSystemPrompt(input);
  assert.match(prompt, /You are Needle/);
});

test("buildAgentSystemPrompt includes project context", () => {
  const ctx: ProjectContext = {
    cwd: "/test/mock-dir",
    packageManager: "pnpm",
    projectType: ["React", "TypeScript"],
    rootFiles: ["package.json", "src"],
    treeSummary: "src/\npackage.json",
    safetyNotes: ["Safe!"]
  };

  const input: AgentPromptInput = {
    task: "do something",
    projectContext: ctx,
    tools: []
  };

  const prompt = buildAgentSystemPrompt(input);
  assert.match(prompt, /\/test\/mock-dir/);
  assert.match(prompt, /pnpm/);
  assert.match(prompt, /React, TypeScript/);
});

test("buildAgentSystemPrompt includes tool names and risk levels", () => {
  const ctx: ProjectContext = {
    cwd: "/test",
    packageManager: "npm",
    projectType: ["Node.js"],
    rootFiles: [],
    treeSummary: "",
    safetyNotes: []
  };

  const mockTool: ToolDefinition = {
    name: "mock-tool",
    description: "Mock tool description",
    riskLevel: "medium",
    isReadOnly: true,
    inputSchemaDescription: "{ \"type\": \"string\" }",
    execute: async () => ({ ok: true, output: "" })
  };

  const input: AgentPromptInput = {
    task: "do something",
    projectContext: ctx,
    tools: [mockTool]
  };

  const prompt = buildAgentSystemPrompt(input);
  assert.match(prompt, /mock-tool/);
  assert.match(prompt, /Risk: medium/);
  assert.match(prompt, /Read-Only: true/);
  assert.match(prompt, /Mock tool description/);
});

test("buildAgentSystemPrompt includes JSON protocol", () => {
  const ctx: ProjectContext = {
    cwd: "/test",
    packageManager: "npm",
    projectType: ["Node.js"],
    rootFiles: [],
    treeSummary: "",
    safetyNotes: []
  };

  const input: AgentPromptInput = {
    task: "do something",
    projectContext: ctx,
    tools: []
  };

  const prompt = buildAgentSystemPrompt(input);
  assert.match(prompt, /PROTOCOL/);
  assert.match(prompt, /\{ "type": "tool_call"/);
  assert.match(prompt, /\{ "type": "final"/);
  assert.match(prompt, /valid JSON ONLY/);
});

test("buildAgentUserPrompt works", () => {
  const prompt = buildAgentUserPrompt("my great task");
  assert.match(prompt, /my great task/);
});