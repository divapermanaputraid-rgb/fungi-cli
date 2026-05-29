import test from "node:test";
import assert from "node:assert/strict";
import { runAgentLoop } from "../../src/core/agent-loop.js";
import { ToolRegistry } from "../../src/tools/registry.js";
import type { ChatMessage, ChatResponse } from "../../src/providers/types.js";

test("agent loop stops on final response", async () => {
  const providerChat = async (messages: ChatMessage[]): Promise<ChatResponse> => {
    return {
      content: JSON.stringify({ type: "final", summary: "Done" }),
      model: "test-model",
      provider: "nine-router"
    };
  };

  const result = await runAgentLoop({
    cwd: process.cwd(),
    task: "do something",
    providerChat,
    maxIterations: 2
  });

  assert.equal(result.ok, true);
  assert.equal(result.iterations, 1);
  assert.equal(result.summary, "Done");
});

test("agent loop executes safe read-only tool", async () => {
  const registry = new ToolRegistry();
  let executed = false;
  
  registry.register({
    name: "safe-read",
    description: "reads",
    riskLevel: "low",
    isReadOnly: true,
    inputSchemaDescription: "{}",
    execute: async () => {
      executed = true;
      return { ok: true, output: "read OK" };
    }
  });

  let callCount = 0;
  const providerChat = async (messages: ChatMessage[]): Promise<ChatResponse> => {
    callCount++;
    if (callCount === 1) {
      return {
        content: JSON.stringify({ type: "tool_call", tool: "safe-read", input: {} }),
        model: "test",
        provider: "nine-router"
      };
    }
    return {
      content: JSON.stringify({ type: "final", summary: "Done" }),
      model: "test",
      provider: "nine-router"
    };
  };

  const result = await runAgentLoop({
    cwd: process.cwd(),
    task: "test",
    providerChat,
    toolRegistry: registry
  });

  assert.equal(result.ok, true);
  assert.equal(executed, true);
  assert.equal(result.toolCalls.length, 1);
  assert.equal(result.toolCalls[0].tool, "safe-read");
  assert.equal(result.toolCalls[0].ok, true);
});

test("agent loop handles unknown tool", async () => {
  let callCount = 0;
  const providerChat = async (messages: ChatMessage[]): Promise<ChatResponse> => {
    callCount++;
    if (callCount === 1) {
      return {
        content: JSON.stringify({ type: "tool_call", tool: "unknown-tool", input: {} }),
        model: "test",
        provider: "nine-router"
      };
    }
    
    // assert the error message was fed back
    const lastMsg = messages[messages.length - 1];
    assert.match(lastMsg.content, /Unknown tool/);
    
    return {
      content: JSON.stringify({ type: "final", summary: "Done after error" }),
      model: "test",
      provider: "nine-router"
    };
  };

  const result = await runAgentLoop({
    cwd: process.cwd(),
    task: "test",
    providerChat,
    toolRegistry: new ToolRegistry()
  });

  assert.equal(result.ok, true);
  assert.equal(result.toolCalls.length, 1);
  assert.equal(result.toolCalls[0].tool, "unknown-tool");
  assert.equal(result.toolCalls[0].ok, false);
});

test("agent loop handles invalid JSON and continues", async () => {
  let callCount = 0;
  const providerChat = async (messages: ChatMessage[]): Promise<ChatResponse> => {
    callCount++;
    if (callCount === 1) {
      return {
        content: "not json",
        model: "test",
        provider: "nine-router"
      };
    }
    
    const lastMsg = messages[messages.length - 1];
    assert.match(lastMsg.content, /Invalid JSON response/);
    
    return {
      content: JSON.stringify({ type: "final", summary: "Done" }),
      model: "test",
      provider: "nine-router"
    };
  };

  const result = await runAgentLoop({
    cwd: process.cwd(),
    task: "test",
    providerChat,
    toolRegistry: new ToolRegistry()
  });

  assert.equal(result.ok, true);
  assert.equal(result.iterations, 2);
});

test("agent loop stops at max iterations", async () => {
  const providerChat = async (messages: ChatMessage[]): Promise<ChatResponse> => {
    return {
      content: "not json",
      model: "test",
      provider: "nine-router"
    };
  };

  const result = await runAgentLoop({
    cwd: process.cwd(),
    task: "test",
    providerChat,
    maxIterations: 2,
    toolRegistry: new ToolRegistry()
  });

  assert.equal(result.ok, false);
  assert.equal(result.iterations, 2);
  assert.match(result.summary, /Reached maximum iterations/);
});

test("agent loop handles ok:false tool result", async () => {
  const registry = new ToolRegistry();
  
  registry.register({
    name: "fail-tool",
    description: "fails",
    riskLevel: "low",
    isReadOnly: true,
    inputSchemaDescription: "{}",
    execute: async () => {
      return { ok: false, output: "Error xyz" };
    }
  });

  let callCount = 0;
  const providerChat = async (messages: ChatMessage[]): Promise<ChatResponse> => {
    callCount++;
    if (callCount === 1) {
      return {
        content: JSON.stringify({ type: "tool_call", tool: "fail-tool", input: {} }),
        model: "test",
        provider: "nine-router"
      };
    }
    
    const lastMsg = messages[messages.length - 1];
    assert.match(lastMsg.content, /Tool failed: Error xyz/);
    
    return {
      content: JSON.stringify({ type: "final", summary: "Done" }),
      model: "test",
      provider: "nine-router"
    };
  };

  const result = await runAgentLoop({
    cwd: process.cwd(),
    task: "test",
    providerChat,
    toolRegistry: registry
  });

  assert.equal(result.ok, true);
  assert.equal(result.toolCalls[0].ok, false);
});

test("dryRun records tool call without executing", async () => {
  const registry = new ToolRegistry();
  let executed = false;
  
  registry.register({
    name: "safe-read",
    description: "reads",
    riskLevel: "low",
    isReadOnly: true,
    inputSchemaDescription: "{}",
    execute: async () => {
      executed = true;
      return { ok: true, output: "read OK" };
    }
  });

  let callCount = 0;
  const providerChat = async (messages: ChatMessage[]): Promise<ChatResponse> => {
    callCount++;
    if (callCount === 1) {
      return {
        content: JSON.stringify({ type: "tool_call", tool: "safe-read", input: { file: "test.ts" } }),
        model: "test",
        provider: "nine-router"
      };
    }
    
    const lastMsg = messages[messages.length - 1];
    assert.match(lastMsg.content, /\[DRY RUN\]/);
    assert.match(lastMsg.content, /test\.ts/);
    
    return {
      content: JSON.stringify({ type: "final", summary: "Done" }),
      model: "test",
      provider: "nine-router"
    };
  };

  const result = await runAgentLoop({
    cwd: process.cwd(),
    task: "test",
    providerChat,
    dryRun: true,
    toolRegistry: registry
  });

  assert.equal(result.ok, true);
  assert.equal(executed, false); // execution skipped!
  assert.equal(result.toolCalls[0].ok, true);
});