import { Message } from 'discord.js';
import { TitleConfig, PostMessageConfig } from '../domain/models/ThreadConfig';
import { TemplateContext, CustomContentFunction } from '../domain/models/Template';
import { existsSync } from 'fs';
import { resolve, extname } from 'path';

export class TemplateEngine {
  async renderTitle(config: TitleConfig, context: TemplateContext): Promise<string> {
    if (config.customContent) {
      return this.renderCustomContent(config.customContent, context);
    }

    if (config.content) {
      return this.renderTemplate(config.content, context);
    }

    return 'New Thread';
  }

  async renderPostMessage(
    config: PostMessageConfig,
    context: TemplateContext
  ): Promise<string | null> {
    if (config.customContent) {
      return this.renderCustomContent(config.customContent, context);
    }

    if (config.content) {
      return this.renderTemplate(config.content, context);
    }

    return null;
  }

  createContext(message: Message, fileName?: string): TemplateContext {
    return {
      message,
      fileName,
      fileExtension: fileName ? extname(fileName).slice(1) : undefined,
      author: message.author.username,
      channelName: message.channel.isDMBased()
        ? 'DM'
        : message.channel.isThread()
          ? message.channel.name
          : 'name' in message.channel
            ? message.channel.name
            : 'Unknown'
    };
  }

  private renderTemplate(template: string, context: TemplateContext): string {
    return template
      .replace(/\{file\}/g, context.fileName || '')
      .replace(/\{fileName\}/g, context.fileName || '')
      .replace(/\{fileExt\}/g, context.fileExtension || '')
      .replace(/\{author\}/g, context.author)
      .replace(/\{authorId\}/g, context.message.author.id)
      .replace(/\{channelName\}/g, context.channelName)
      .replace(/\{messageId\}/g, context.message.id);
  }

  private async renderCustomContent(
    contentPath: string,
    context: TemplateContext
  ): Promise<string> {
    const fullPath = resolve(contentPath);

    if (!existsSync(fullPath)) {
      throw new Error(`Custom content script not found: ${contentPath}`);
    }

    const contentModule = await import(fullPath);
    const contentFn: CustomContentFunction = contentModule.default || contentModule;

    if (typeof contentFn !== 'function') {
      throw new Error(`Custom content script must export a function: ${contentPath}`);
    }

    return contentFn(context);
  }
}
