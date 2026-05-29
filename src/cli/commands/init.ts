import { Command } from 'commander';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createDefaultConfig } from '../../config/loader';

export const initCommand = new Command('init')
  .description('Initialize Needle workspace in the current directory')
  .option('-f, --force', 'Overwrite existing configuration')
  .action(async (options) => {
    const cwd = process.cwd();
    const needleDir = path.join(cwd, '.needle');
    
    try {
      await fs.mkdir(needleDir, { recursive: true });
      await fs.mkdir(path.join(needleDir, 'sessions'), { recursive: true });
      await fs.mkdir(path.join(needleDir, 'cache'), { recursive: true });

      const memoryContent = `# Needle Project Memory

This file stores durable project context for Needle.

Rules:
- Do not store secrets.
- Do not store API keys.
- Store technical decisions, project conventions, and architectural notes.
- Keep this file concise.
`;

      const memoryPath = path.join(needleDir, 'MEMORY.md');
      try {
        await fs.access(memoryPath);
        if (options.force) {
          await fs.writeFile(memoryPath, memoryContent, 'utf-8');
        }
      } catch {
        await fs.writeFile(memoryPath, memoryContent, 'utf-8');
      }

      const configPath = path.join(needleDir, 'config.json');
      let shouldWriteConfig = true;
      try {
        await fs.access(configPath);
        if (!options.force) {
          shouldWriteConfig = false;
        }
      } catch {
        // file doesn't exist, proceed with writing
      }

      if (shouldWriteConfig) {
        const config = createDefaultConfig();
        await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
      }

      if (!shouldWriteConfig) {
        console.log('Initialization skipped for config.json (already exists). Use --force to overwrite.');
      } else {
        console.log('Successfully initialized Needle workspace.');
      }
    } catch (err: any) {
      console.error(`Initialization failed: ${err.message}`);
      process.exit(1);
    }
  });