// FungiCode OpenAI-compatible adapter — Sprint 0 placeholder
import type { Provider, CompletionRequest, CompletionResponse, ModelProfile } from "./types.js";

export class OpenAICompatibleProvider implements Provider {
  name: string;
  supportedProfiles: ModelProfile[] = ["fast", "smart", "coder"];
  private baseUrl: string;
  private model: string;

  constructor(opts: { name: string; baseUrl: string; model: string }) {
    this.name = opts.name;
    this.baseUrl = opts.baseUrl;
    this.model = opts.model;
  }

  isAvailable(): boolean {
    return !!process.env.OPENAI_API_KEY;
  }

  // TODO: Sprint 1 — implement fetch call to baseUrl/chat/completions
  async complete(_req: CompletionRequest): Promise<CompletionResponse> {
    throw new Error("OpenAICompatibleProvider.complete() not yet implemented — Sprint 1");
  }
}
