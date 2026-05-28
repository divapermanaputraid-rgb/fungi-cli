// FungiCode 9Router Provider — Sprint 0 placeholder
// 9Router is a multi-model routing API
import type { Provider, CompletionRequest, CompletionResponse, ModelProfile } from "./types.js";

export class NineRouterProvider implements Provider {
  name = "nine-router";
  supportedProfiles: ModelProfile[] = ["fast", "smart", "coder", "planner", "reviewer"];

  isAvailable(): boolean {
    return !!process.env.NINE_ROUTER_API_KEY;
  }

  // TODO: Sprint 1 — implement actual 9Router API call
  async complete(_req: CompletionRequest): Promise<CompletionResponse> {
    throw new Error("NineRouterProvider.complete() not yet implemented — Sprint 1");
  }
}
