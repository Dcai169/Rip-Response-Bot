module.exports = {
	name: 'about-me', // trigger phrase
	description: 'States about me',
	execute(message, args) {
        let messageText = 'I am The Librarian. I was built to serve the patrons of this server in their quests for models. If you need me, use \`?_\` followed by your query, and I\'ll do my best to find them for you. If you find an error, contact my creator, MrTrainCow#5154.';
        message.channel.send(messageText);
		return messageText;
	},
};