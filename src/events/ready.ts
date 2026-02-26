import { Events, Client } from 'discord.js';

export function registerReadyHandler() {
  return {
    name: Events.ClientReady,
    once: true,
    execute(client: Client) {
      console.log(`Logged in as ${client.user?.tag}`);
    }
  };
}
