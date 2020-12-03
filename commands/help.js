module.exports = {
	name: 'help', // trigger phrase
	description: 'States help',
	execute(message, args) {
        let messageText = 'Use \`?_\` followed by your query, and I\'ll do my best to find them for you. If you are searching for armor, you can specify what Class and gender you are looking for to narrow down my search. Be aware though, some exotic armor pieces only have one gender ripped. If you find an error, contact my creator, MrTrainCow#5154.';
        message.channel.send(messageText);
		return messageText;
	},
};