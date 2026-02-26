Discord bot for creating threads based on message content.

Uses configuration based, example configuration below, config is array based so multiple setups can be run on one bot:

config.js:

```js
[
    {
        // array of discord channel IDs for the functionality to run in, is a whitelist of channels, this bot does NOTHING on channels that are not specified in a config
        channelIds: [],

        // filter config to determine if thread should be created
        filter: {
            // message contains text content
            messageFilter: "create thread",

            // message contains <file type> create thread, should support multiple dots, like '*.item.gbx' too, etc
            fileFilter: "*.gbx",

            // custom filter that is passed the d.js message object to determine
            customFilter: "./filterScript.js",
        },

        // title config for name of the thread
        title: {
            // title with templating, contains some common variables useful from the message that triggered the
            content: "{file} thread",

            // See filter.customFilter, same idea here but for title
            customContent: "./titleScript.js",
        },

        // message that is sent in the thread after it's created
        postMessage: {
            // can also contain some templating, i cant think of what values would be useful at this moment
            content: "<@someroleid> come see this",

            // you get the idea by now...
            customContent: "./postMessageScript.js",
        },
    },
];
```

Bot should contain slash commands that can be ran by admins. Bot owner needs to add admins with a slash command.
