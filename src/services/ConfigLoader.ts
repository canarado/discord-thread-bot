import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { ThreadConfig, ThreadConfigList } from '../domain/models/ThreadConfig';

export class ConfigLoader {
  private configs: ThreadConfigList = [];

  async load(configPath: string): Promise<void> {
    if (!existsSync(configPath)) {
      throw new Error(`Configuration file not found: ${configPath}`);
    }

    const content = await readFile(configPath, 'utf-8');
    const parsed = JSON.parse(content);

    if (!Array.isArray(parsed)) {
      throw new Error('Configuration must be an array');
    }

    this.validateConfigs(parsed);
    this.configs = parsed;
  }

  private validateConfigs(configs: unknown[]): asserts configs is ThreadConfigList {
    for (const config of configs) {
      this.validateConfig(config);
    }
  }

  private validateConfig(config: unknown): asserts config is ThreadConfig {
    if (typeof config !== 'object' || config === null) {
      throw new Error('Each config must be an object');
    }

    const cfg = config as Record<string, unknown>;

    if (!Array.isArray(cfg.channelIds)) {
      throw new Error('channelIds must be an array');
    }

    if (typeof cfg.filter !== 'object' || cfg.filter === null) {
      throw new Error('filter must be an object');
    }

    if (typeof cfg.title !== 'object' || cfg.title === null) {
      throw new Error('title must be an object');
    }

    if (typeof cfg.postMessage !== 'object' || cfg.postMessage === null) {
      throw new Error('postMessage must be an object');
    }
  }

  getConfigs(): ThreadConfigList {
    return this.configs;
  }

  getConfigsForChannel(channelId: string): ThreadConfigList {
    return this.configs.filter(config => config.channelIds.includes(channelId));
  }
}
