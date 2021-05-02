const { client } = require("../index");
const config = require('../config.json');

module.exports = (client) => {
    client.on("ready", () => {
        let prefix = client.prefix.get(client.token);

        console.log(client.user.tag, 'is now online');
        prefix ? console.log(`Prefix: ${prefix}`) : console.log()

        let statuses = [];
        let status = statuses[Math.floor(Math.random() * statuses.length)];
        client.user.setStatus("online");
        client.user.setActivity(status, {
            type: "WATCHING",
            url: "https://www.twitch.tv/#"
        });
    });
}