const { client } = require("../index");
const { MessageEmbed, Collection } = require("discord.js");

module.exports = (client) => {
    client.on("message", async message => {
        let prefix = client.prefix.get(client.token);

        if (message.author.bot) return;

        if (
            message.mentions.has(client.user.id, { ignoreRoles: true, ignoreEveryone: true }) &&
            message.content.toLowerCase().includes('prefix') &&
            message.channel.type == 'text' &&
            message.channel.permissionsFor(client.user.id).has('SEND_MESSAGES')
        ) {
            return message.inlineReply(`My prefix for this server is \`${prefix}\``);
        };

        if (message.channel.type === "dm" || !message.content.startsWith(prefix)) return;

        let messageArray = message.content.split(" ");
        let cmd = messageArray[0].toLowerCase();
        let args = messageArray.slice(1);
        let commandfile =
            client.commands.get(cmd.slice(prefix.length)) ||
            client.commands.get(client.aliases.get(cmd.slice(prefix.length)));
        if (!commandfile) return;

        let permConvert = {
            "ADMINISTRATOR": "Administrator",
            "CREATE_INSTANT_INVITE": "Create Instant Invite",
            "KICK_MEMBERS": "Kick Members",
            "BAN_MEMBERS": "Ban Members",
            "MANAGE_CHANNELS": "Manage Channels",
            "MANAGE_GUILD": "Manage Server",
            "ADD_REACTIONS": "Add Reactions",
            "VIEW_AUDIT_LOG": "View Audit Log",
            "PRIORITY_SPEAKER": "Priority Speaker",
            "STREAM": "Stream",
            "VIEW_CHANNEL": "View Channel",
            "SEND_MESSAGES": "Send Message",
            "SEND_TTS_MESSAGES": "Send TTS Messages",
            "MANAGE_MESSAGES": "Manage Messages",
            "EMBED_LINKS": "Embed Links",
            "ATTACH_FILES": "Attach Files",
            "READ_MESSAGE_HISTORY": "Read Message History",
            "MENTION_EVERYONE": "Mention Everyone",
            "USE_EXTERNAL_EMOJIS": "Use Extermal Emojis",
            "CONNECT": "Connect",
            "SPEAK": "Speak",
            "MUTE_MEMBERS": "Mute Members",
            "DEAFEN_MEMBERS": "Deafen Members",
            "MOVE_MEMBERS": "Move Members",
            "USE_VAD": "Use VAD",
            "CHANGE_NICKNAME": "Change Nickname",
            "MANAGE_NICKNAMES": "Manage Nicknames",
            "MANAGE_ROLES": "Manage Roles",
            "MANAGE_WEBHOOKS": "Manage Webhooks",
            "MANAGE_EMOJIS": "Manage Emojis"
        };

        if (![client.developer.id, message.guild.ownerID].includes(message.author.id)) {
            for (const perm of commandfile.userPermissions) {
                if (!message.channel.permissionsFor(message.author.id).has(perm)) return;
            };
        };

        if (message.channel.type == 'text' && !message.channel.permissionsFor(client.user.id).has('SEND_MESSAGES')) return message.author.send(`
Sorry, I can't help you with this since I'm missing the \`SEND_MESSAGES\` permission for <#${message.channel.id}>.
You can fix this by going to **Server Settings** > **Roles** and checking the permissions for the **${client.user.username}** role.
Additionally, you should check channel override permissions by going to **Edit Channel** > **Permissions** and checking permissions for each role I have.
`);

        if (commandfile.maintenance && ![client.developer.id].includes(message.author.id)) return message.inlineReply('This command is still being worked on, please check back later...')

        if (commandfile.category.toLowerCase() == 'developer' && ![client.developer.id].includes(message.author.id)) return message.inlineReply('This command is for the developer only!')

        for (const perm of commandfile.clientPermissions) {
            if (!message.channel.permissionsFor(client.user.id).has(perm)) return message.inlineReply(`
Sorry, I can't help you with this since I'm missing the \`${permConvert[perm]}\` permission.
You can fix this by going to **Server Settings** > **Roles** and checking the permissions for the **${client.user.username}** role.
`)
        };

        if (commandfile.args && !args.length) {
            return message.inlineReply(
                new MessageEmbed()
                    .setColor('RANDOM')
                    .setTitle(`${prefix}${commandfile.name} info`)
                    .addField('Description:', commandfile.description ? commandfile.description : '*The description for this command is currently unavailable.*')
                    .addField('Usage:', `\`${commandfile.usage ? `${prefix}${commandfile.name} ${commandfile.usage}` : `${prefix}${commandfile.name}`}\``)
                    .addField('Aliases:', `${commandfile.name}${commandfile.aliases.length == 0 ? '' : ','} ${commandfile.aliases.join(`, `)}`)
                    .addField('Cooldown:', commandfile.cooldown === -1 ? '*None*' : `${commandfile.cooldown}s`)
                    .addField('Permissions Needed:', commandfile.clientPermissions.length == 0 ? `lol if ur seeing this, this *could* be a pretty big bug... pls send a screenshot of this to <@${client.developer.id}>` : `\`${commandfile.clientPermissions.join('`, `')}\``)
            )
        }

        let command = messageArray[0].toLowerCase().slice(prefix.length);

        if (message.author.id != client.developer.id) {
            if (![].includes(command)) {
                if (!client.cooldowns.has(commandfile.name)) {
                    client.cooldowns.set(commandfile.name, new Collection());
                }
                const now = Date.now();
                const timestamps = client.cooldowns.get(commandfile.name);
                const cooldownAmount = (commandfile.cooldown || 3) * 1000;
                if (timestamps.has(message.author.id)) {
                    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
                    if (now < expirationTime) {
                        const timeLeft = (expirationTime - now) / 1000;
                        return message.inlineReply(
                            new MessageEmbed()
                                .setColor("RANDOM")
                                .setTitle("You're going too fast")
                                .setFooter('While you wait, gimme nitro pls :P')
                                .setDescription(`
You can use this command in **${timeLeft.toFixed(0)} seconds**
The cooldown for this command is \`${commandfile.cooldown}s\`.
`)
                        );
                    }
                }
                timestamps.set(message.author.id, now);
                setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
            }
        }

        try {
            commandfile.execute(client, message, args);
        } catch (error) {
            console.log(error);
            message.react('❌');
            message.inlineReply(`
<@${client.developer.id}>
An unexpected error has occurred:
${error}
`);
        }
    });
}