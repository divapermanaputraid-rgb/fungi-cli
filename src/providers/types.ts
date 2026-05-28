// FungiCode Provider Types — Sprint 0 interfaces

export type ModelProfile = "fast" | "smart" | "coder" | "planner" | "reviewer";

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface CompletionRequest {
  messages: Message[];
  profile: ModelProfile;
  maxTokens?: number;
  temperature?: number;
}

export interface CompletionResponse {
  content: string;
  provider: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
  };
}

export interface Provider {
  name: string;
  supportedProfiles: ModelProfile[];
  complete(req: CompletionRequest): Promise<CompletionResponse>;
  isAvailable(): boolean;
}

export interface ModelConfig {
  fast: string;
  smart: string;
  coder: string;
  planner: string;
  reviewer: string;
}

export type PermissionMode = "ask" | "auto-low-risk" | "yolo";

export interface FungiConfig {
  defaultProvider: string;
  models: ModelConfig;
  permissions: {
    mode: PermissionMode;
  };
}