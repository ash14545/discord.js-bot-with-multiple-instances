module.exports = {
    maintenance: false,
    category: "",
    name: "helloworld",
    aliases: ["hello"],
    description: "Hello world!",
    usage: "",
    cooldown: -1,
    clientPermissions: ['SEND_MESSAGES'],
    userPermissions: ['SEND_MESSAGES'],
    args: false,
    async execute(client, message, args) {
        message.channel.send('Hello world!');
    }
};
