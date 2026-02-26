import { Events, Message } from 'discord.js';
import { ConfigLoader } from '../services/ConfigLoader';
import { ThreadService } from '../services/ThreadService';

export function registerMessageHandler(configLoader: ConfigLoader, threadService: ThreadService) {
  return {
    name: Events.MessageCreate,
    async execute(message: Message) {
      if (message.author.bot) {
        return;
      }

      const configs = configLoader.getConfigsForChannel(message.channelId);

      if (configs.length === 0) {
        return;
      }

      for (const config of configs) {
        try {
          await threadService.processMessage(message, config);
        } catch (error) {
          console.error('Error processing message for thread creation:', error);
        }
      }
    }
  };
}
