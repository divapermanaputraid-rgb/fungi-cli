import { Command } from 'commander';
import { loadFungiConfig, saveFungiConfig } from '../../config/loader';
import { DEFAULT_PROVIDER_CONFIGS } from '../../config/schema';
import type { ModelProfile } from '../../providers/types';

export const configCommand = new Command('config')
  .description('Manage FungiCode configuration')
  .action(() => {
    configCommand.help();
  });

configCommand
  .command('get')
  .description('View current configuration')
  .action(async () => {
    try {
      const config = await loadFungiConfig(process.cwd());
      console.log(JSON.stringify(config, null, 2));
    } catch (err: any) {
      console.error(err.message);
      process.exit(1);
    }
  });

configCommand
  .command('set <key> <value>')
  .description('Set a configuration value (e.g., provider, model.<profile>)')
  .action(async (key: string, value: string) => {
    try {
      const config = await loadFungiConfig(process.cwd());

      if (key === 'provider') {
        const mergedProviders = { ...DEFAULT_PROVIDER_CONFIGS, ...(config.providers ?? {}) };
        if (!mergedProviders[value]) {
          console.error(`Error: Unknown provider '${value}'.`);
          process.exit(1);
        }
        config.defaultProvider = value;
      } else if (key.startsWith('model.')) {
        const profile = key.split('.')[1] as ModelProfile;
        const validProfiles: ModelProfile[] = ['fast', 'smart', 'coder', 'planner', 'reviewer'];
        if (!validProfiles.includes(profile)) {
          console.error(`Error: Unknown model profile '${profile}'. Valid profiles are: ${validProfiles.join(', ')}`);
          process.exit(1);
        }
        config.models[profile] = value;
      } else {
        console.error(`Error: Unsupported config key '${key}'. Supported keys are 'provider' and 'model.<profile>'.`);
        process.exit(1);
      }

      await saveFungiConfig(process.cwd(), config);
      console.log(`Successfully set ${key} to ${value}`);
    } catch (err: any) {
      console.error(err.message);
      process.exit(1);
    }
  });