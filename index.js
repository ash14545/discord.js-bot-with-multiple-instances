const { Discord, Collection } = require('discord.js');
const config = require('./config.json');

for (const [token, prefix] of Object.entries(config.tokens)) {
    const DiscordClient = require("./struct/Client.js");
    const client = new DiscordClient();

    client.commands = new Collection();
    client.aliases = new Collection();

    client.prefix.set(token, prefix)

    require("./functions")(client);

    client.login(token)

    module.exports = {
        client: client
    };
};