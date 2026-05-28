// FungiCode DeepSeek Provider — Sprint 0 placeholder
import type { Provider, CompletionRequest, CompletionResponse, ModelProfile } from "./types.js";

export class DeepSeekProvider implements Provider {
  name = "deepseek";
  supportedProfiles: ModelProfile[] = ["coder", "fast"];

  isAvailable(): boolean {
    return !!process.env.DEEPSEEK_API_KEY;
  }

  // TODO: Sprint 1 — implement DeepSeek API call (OpenAI-compatible endpoint)
  async complete(_req: CompletionRequest): Promise<CompletionResponse> {
    throw new Error("DeepSeekProvider.complete() not yet implemented — Sprint 1");
  }
}
