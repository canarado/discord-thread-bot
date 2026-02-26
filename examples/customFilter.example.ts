import { Message } from 'discord.js';

export default async function (message: Message) {
  const hasAttachment = message.attachments.size > 0;
  const mentionsBot = message.mentions.users.has(message.client.user!.id);

  return {
    shouldCreateThread: hasAttachment && mentionsBot
  };
}
