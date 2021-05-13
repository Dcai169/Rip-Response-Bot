module.exports = {
    name: 'commands',
    description: 'Sends command list',
    execute(message) {
        let messageText = 'All commands must be invoked using \`?_\` as a prefix.\
            about-me: About me\
            commands: This list of commands\
            help: Search help\
            source: My source code on GitHub';
        message.channel.send(messageText);
		return messageText;
    },
};