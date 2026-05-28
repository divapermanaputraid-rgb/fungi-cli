// FungiCode Gemini Provider — Sprint 0 placeholder
import type { Provider, CompletionRequest, CompletionResponse, ModelProfile } from "./types.js";

export class GeminiProvider implements Provider {
  name = "gemini";
  supportedProfiles: ModelProfile[] = ["smart", "planner"];

  isAvailable(): boolean {
    return !!process.env.GEMINI_API_KEY;
  }

  // TODO: Sprint 1 — implement Google Generative AI SDK call
  async complete(_req: CompletionRequest): Promise<CompletionResponse> {
    throw new Error("GeminiProvider.complete() not yet implemented — Sprint 1");
  }
}
