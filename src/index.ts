import { config } from 'dotenv';
import { Client, ClientEvents, GatewayIntentBits } from 'discord.js';
import { ConfigLoader } from './services/ConfigLoader';
import { FilterEngine } from './services/FilterEngine';
import { TemplateEngine } from './services/TemplateEngine';
import { ThreadService } from './services/ThreadService';
import { registerReadyHandler } from './events/ready';
import { registerMessageHandler } from './events/messageCreate';

config();

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

if (!DISCORD_TOKEN) {
  console.error('Missing DISCORD_TOKEN environment variable');
  process.exit(1);
}

async function main() {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
    ]
  });

  const configLoader = new ConfigLoader();
  const filterEngine = new FilterEngine();
  const templateEngine = new TemplateEngine();
  const threadService = new ThreadService(filterEngine, templateEngine);

  try {
    await configLoader.load('./config.json');
    configLoader.enableHotReload();
    console.log('Configuration loaded successfully');
  } catch (error) {
    console.error('Failed to load config.json:', error);
    console.log('Bot will not process any messages until config.json is created');
  }

  const events = [registerReadyHandler(), registerMessageHandler(configLoader, threadService)];

  for (const event of events) {
    if ('once' in event && event.once) {
      client.once(event.name as keyof ClientEvents, (...args) =>
        (event.execute as (...args: unknown[]) => void)(...args)
      );
    } else {
      client.on(event.name as keyof ClientEvents, (...args) =>
        (event.execute as (...args: unknown[]) => void)(...args)
      );
    }
  }

  await client.login(DISCORD_TOKEN);
}

main().catch(console.error);
