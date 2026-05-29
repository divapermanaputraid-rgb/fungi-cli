import fs from 'node:fs/promises';
import path from 'node:path';
import { NeedleConfigSchema, NeedleConfig, ResolvedProviderConfig, DEFAULT_PROVIDER_CONFIGS } from './schema';
import type { ProviderId, ModelProfile } from '../providers/types';

const CONFIG_DIR = '.needle';
const CONFIG_FILE = 'config.json';

export async function loadNeedleConfig(cwd: string): Promise<NeedleConfig> {
  const configPath = path.join(cwd, CONFIG_DIR, CONFIG_FILE);
  try {
    const data = await fs.readFile(configPath, 'utf-8');
    const parsed = JSON.parse(data);
    return NeedleConfigSchema.parse(parsed);
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      throw new Error(`Config file not found at ${configPath}. Please run 'needle init'.`);
    }
    throw new Error(`Failed to load config: ${err.message}`);
  }
}

export async function saveNeedleConfig(cwd: string, config: NeedleConfig): Promise<void> {
  const configDir = path.join(cwd, CONFIG_DIR);
  const configPath = path.join(configDir, CONFIG_FILE);
  await fs.mkdir(configDir, { recursive: true });
  await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
}

export function createDefaultConfig(): NeedleConfig {
  return NeedleConfigSchema.parse({});
}

export function resolveModelProfile(config: NeedleConfig, profile: ModelProfile): string {
  const modelId = config.models[profile];
  if (!modelId) {
    throw new Error(`Model profile '${profile}' is not configured. Run 'needle config set model.${profile} <modelId>'.`);
  }
  return modelId;
}

export function resolveProviderConfig(config: NeedleConfig, providerId?: ProviderId): ResolvedProviderConfig {
  const id = providerId || config.defaultProvider;
  const mergedProviders = { ...DEFAULT_PROVIDER_CONFIGS, ...(config.providers ?? {}) };
  const providerConfig = mergedProviders[id];
  if (!providerConfig) {
    throw new Error(`Provider '${id}' is not configured.`);
  }
  return providerConfig as ResolvedProviderConfig;
}
