// FungiCode Provider Router — Sprint 0 placeholder
import type { Provider, CompletionRequest, CompletionResponse } from "./types.js";

export class ProviderRouter {
  private providers: Map<string, Provider> = new Map();

  register(provider: Provider): void {
    this.providers.set(provider.name, provider);
  }

  // TODO: Sprint 1 — route by profile, fallback chain, cost tracking
  async route(req: CompletionRequest): Promise<CompletionResponse> {
    throw new Error("ProviderRouter.route() not yet implemented — Sprint 1");
  }
}
