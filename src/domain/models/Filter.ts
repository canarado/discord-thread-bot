import { Message } from 'discord.js';

export interface FilterResult {
  shouldCreateThread: boolean;
}

export type CustomFilterFunction = (message: Message) => Promise<FilterResult> | FilterResult;
