import type { ModelProfile, ChatMessage, ChatResponse } from "../providers/types.js";
import { buildProjectContext } from "../core/context-builder.js";
import { buildPlannerSystemPrompt, buildPlannerUserPrompt } from "../core/prompt-builder.js";
import { loadNeedleConfig } from "../config/loader.js";
import { createProviderRouter } from "../providers/router.js";
import { appendSessionRecord, createSessionId, SessionRecord } from "../core/session.js";

export interface PlanModeOptions {
  cwd: string;
  task: string;
  profile?: ModelProfile;
  providerChat?: (messages: ChatMessage[]) => Promise<ChatResponse>;
  dryRun?: boolean;
}

export interface PlanModeResult {
  ok: boolean;
  plan: string;
  profile: ModelProfile;
  usedProvider: boolean;
  error?: string;
}

export async function runPlanMode(options: PlanModeOptions): Promise<PlanModeResult> {
  const startTime = Date.now();
  const profile: ModelProfile = options.profile || "planner";
  const usedProvider = !options.dryRun && !options.providerChat;

  try {
    const config = await loadNeedleConfig(options.cwd);
    
    // Build project context
    const projectContext = await buildProjectContext({ cwd: options.cwd });

    // Build planner prompts
    const systemPrompt = buildPlannerSystemPrompt({
      task: options.task,
      projectContext,
    });
    const userPrompt = buildPlannerUserPrompt(options.task);

    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    let plan = "";

    if (options.dryRun) {
      plan = "Dry run: Prompt built successfully, but provider was not called.";
    } else if (options.providerChat) {
      // Used in tests
      const response = await options.providerChat(messages);
      plan = response.content;
    } else {
      // Use real provider router
      const router = createProviderRouter(config);
      const response = await router.chatWithProfile({
        profile,
        messages,
      });
      plan = response.content;
    }

    const result: PlanModeResult = {
      ok: true,
      plan,
      profile,
      usedProvider,
    };

    const record: SessionRecord = {
      id: createSessionId(),
      createdAt: new Date().toISOString(),
      mode: "plan",
      task: options.task,
      cwd: options.cwd,
      profile: typeof profile === "string" ? profile : undefined,
      status: "success",
      durationMs: Date.now() - startTime,
      summary: plan,
    };
    await appendSessionRecord(options.cwd, record);

    return result;
  } catch (error: any) {
    const errMsg = error instanceof Error ? error.message : String(error);
    
    const record: SessionRecord = {
      id: createSessionId(),
      createdAt: new Date().toISOString(),
      mode: "plan",
      task: options.task,
      cwd: options.cwd,
      profile: typeof profile === "string" ? profile : undefined,
      status: "failure",
      durationMs: Date.now() - startTime,
      summary: `Failed to create plan: ${errMsg}`,
      errors: [errMsg],
    };
    await appendSessionRecord(options.cwd, record);

    // Return clean result for missing/invalid provider/api key without stack trace
    return {
      ok: false,
      plan: "",
      profile,
      usedProvider,
      error: errMsg
    };
  }
}
