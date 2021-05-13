module.exports = {
	name: 'help', // trigger phrase
	description: 'States help',
	execute(message, args) {
        let messageText = 'Use \`search\` command, and I\'ll do my best to find them for you. If you find an error, contact my creator, MrTrainCow#5154.';
        message.channel.send(messageText);
		return messageText;
	},
};