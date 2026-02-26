import { existsSync, watch } from 'fs';
import { readFile } from 'fs/promises';
import { ThreadConfig, ThreadConfigList } from '../domain/models/ThreadConfig';

export class ConfigLoader {
  private configs: ThreadConfigList = [];
  private configPath: string = '';
  private reloadTimeout: NodeJS.Timeout | null = null;

  async load(configPath: string): Promise<void> {
    if (!existsSync(configPath)) {
      throw new Error(`Configuration file not found: ${configPath}`);
    }

    this.configPath = configPath;
    const content = await readFile(configPath, 'utf-8');
    const parsed = JSON.parse(content);

    if (!Array.isArray(parsed)) {
      throw new Error('Configuration must be an array');
    }

    this.validateConfigs(parsed);
    this.configs = parsed;
  }

  enableHotReload(): void {
    if (!this.configPath) {
      throw new Error('Cannot enable hot reload before loading config');
    }

    console.log(`Watching ${this.configPath} for changes`);

    watch(this.configPath, async eventType => {
      if (eventType === 'change') {
        if (this.reloadTimeout) {
          clearTimeout(this.reloadTimeout);
        }

        this.reloadTimeout = setTimeout(async () => {
          try {
            console.log('Config file changed, reloading...');
            await this.load(this.configPath);
            console.log('Configuration reloaded successfully');
          } catch (error) {
            console.error('Failed to reload config (keeping previous config):', error);
          }
        }, 100);
      }
    });
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
