# Thread Bot

Discord bot for creating threads based on message content, with support for filters, custom scripts, and template-based naming.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

3. Fill in your Discord bot credentials in `.env`:
   - `DISCORD_TOKEN`: Your bot token from Discord Developer Portal
   - `ADMIN_IDS`: Comma-separated list of Discord user IDs (does not do anything at the moment)

4. Create a `config.json` file based on `config.example.json`

5. Build and run:

```bash
npm run build
npm start
```

For development with hot reload:

```bash
npm run dev
```

## Configuration

The bot uses a JSON configuration file (`config.json`) that defines an array of thread creation rules.

### Basic Structure

```json
[
  {
    "channelIds": ["123456789"],
    "filter": {
      "messageFilter": "create thread",
      "fileFilter": "*.gbx"
    },
    "title": {
      "content": "{file} thread"
    }
  }
]
```

### Configuration Properties

#### channelIds (required)

Array of Discord channel IDs where this configuration applies. The bot only operates in whitelisted channels.

#### filter (required)

Determines when a thread should be created.

- `messageFilter`: String that must be present in message content
- `fileFilter`: Glob pattern for file attachments (supports patterns like `*.gbx`, `*.item.gbx`)
- `customFilter`: Path to a custom filter script (see Custom Scripts below)

Filters are combined with AND logic when multiple are specified.

#### title (required)

Configuration for thread title.

- `content`: Template string for the title (see Template Variables below)
- `customContent`: Path to custom title generation script

#### postMessage (optional)

Configuration for the initial message posted in the thread. If omitted, no message will be posted.

- `content`: Template string for the message
- `customContent`: Path to custom message generation script

### Template Variables

The following variables can be used in `content` templates:

- `{file}` or `{fileName}`: Name of the first matching file attachment
- `{fileExt}`: File extension without the dot
- `{author}`: Username of the message author
- `{authorId}`: User ID of the message author
- `{channelName}`: Name of the channel
- `{messageId}`: ID of the message

### Custom Scripts

Custom scripts allow for advanced filtering and content generation.

#### Custom Filter

Create a JavaScript/TypeScript file that exports a function:

```typescript
import { Message } from 'discord.js';

export default async function (message: Message) {
  return {
    shouldCreateThread: true
  };
}
```

#### Custom Title/Content

Create a JavaScript/TypeScript file that exports a function:

```typescript
import { TemplateContext } from './src/domain/models/Template';

export default async function (context: TemplateContext) {
  return `Custom title for ${context.fileName}`;
}
```

## Project Structure

```
src/
├── domain/
│   └── models/        Domain models and type definitions
├── events/            Discord event handlers
├── services/          Core business logic services
└── index.ts           Application entry point
```

## Development

The project uses TypeScript with strict typing enabled. Key architectural decisions:

- Domain models define clear boundaries between concerns
- Services encapsulate business logic
- Event handlers remain thin and delegate to services
- Commands follow a consistent pattern for admin checks
  Zero on-disk storage except for configuration file

## License

ISC
