import { Message } from 'discord.js';

export interface TemplateContext {
  message: Message;
  fileName?: string;
  fileExtension?: string;
  author: string;
  channelName: string;
}

export type CustomContentFunction = (context: TemplateContext) => Promise<string> | string;
