import { Message } from 'discord.js';
import { FilterConfig } from '../domain/models/ThreadConfig';
import { CustomFilterFunction, FilterResult } from '../domain/models/Filter';
import { existsSync } from 'fs';
import { resolve } from 'path';

export class FilterEngine {
  async shouldCreateThread(message: Message, filterConfig: FilterConfig): Promise<FilterResult> {
    if (filterConfig.customFilter) {
      return this.applyCustomFilter(message, filterConfig.customFilter);
    }

    if (
      filterConfig.messageFilter &&
      !this.matchesMessageFilter(message, filterConfig.messageFilter)
    ) {
      return { shouldCreateThread: false };
    }

    if (filterConfig.fileFilter && !this.matchesFileFilter(message, filterConfig.fileFilter)) {
      return { shouldCreateThread: false };
    }

    return { shouldCreateThread: true };
  }

  private matchesMessageFilter(message: Message, filter: string): boolean {
    return message.content.toLowerCase().includes(filter.toLowerCase());
  }

  private matchesFileFilter(message: Message, filter: string): boolean {
    if (message.attachments.size === 0) {
      return false;
    }

    const pattern = this.createGlobRegex(filter);

    return Array.from(message.attachments.values()).some(attachment =>
      pattern.test(attachment.name)
    );
  }

  private createGlobRegex(pattern: string): RegExp {
    const escaped = pattern.replace(/\./g, '\\.').replace(/\*/g, '.*');

    return new RegExp(`^${escaped}$`, 'i');
  }

  private async applyCustomFilter(message: Message, filterPath: string): Promise<FilterResult> {
    const fullPath = resolve(filterPath);

    if (!existsSync(fullPath)) {
      throw new Error(`Custom filter not found: ${filterPath}`);
    }

    const filterModule = await import(fullPath);
    const filterFn: CustomFilterFunction = filterModule.default || filterModule;

    if (typeof filterFn !== 'function') {
      throw new Error(`Custom filter must export a function: ${filterPath}`);
    }

    return filterFn(message);
  }

  getFirstMatchingFileName(message: Message, filter?: string): string | undefined {
    if (message.attachments.size === 0) {
      return undefined;
    }

    if (!filter) {
      return Array.from(message.attachments.values())[0].name;
    }

    const pattern = this.createGlobRegex(filter);
    const attachment = Array.from(message.attachments.values()).find(att => pattern.test(att.name));

    return attachment?.name;
  }
}
