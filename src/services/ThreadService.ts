import { Message, ThreadAutoArchiveDuration, TextChannel } from 'discord.js';
import { ThreadConfig } from '../domain/models/ThreadConfig';
import { FilterEngine } from './FilterEngine';
import { TemplateEngine } from './TemplateEngine';

export class ThreadService {
  constructor(
    private filterEngine: FilterEngine,
    private templateEngine: TemplateEngine
  ) {}

  async processMessage(message: Message, config: ThreadConfig): Promise<void> {
    const filterResult = await this.filterEngine.shouldCreateThread(message, config.filter);

    if (!filterResult.shouldCreateThread) {
      return;
    }

    const fileName = this.filterEngine.getFirstMatchingFileName(message, config.filter.fileFilter);
    const context = this.templateEngine.createContext(message, fileName);

    const threadTitle = await this.templateEngine.renderTitle(config.title, context);
    const postMessageContent = config.postMessage
      ? await this.templateEngine.renderPostMessage(config.postMessage, context)
      : null;

    await this.createThread(message, threadTitle, postMessageContent);
  }

  private async createThread(
    message: Message,
    title: string,
    postMessageContent: string | null
  ): Promise<void> {
    if (!message.channel.isTextBased() || message.channel.isDMBased()) {
      return;
    }

    const channel = message.channel as TextChannel;

    if (!channel.isTextBased() || !('threads' in channel)) {
      return;
    }

    const thread = await channel.threads.create({
      name: title.slice(0, 100),
      startMessage: message,
      autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek
    });

    if (postMessageContent) {
      await thread.send(postMessageContent);
    }
  }
}
