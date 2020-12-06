module.exports = {
	name: 'source', // trigger phrase
	description: 'States about me',
	execute(message, args) {
        let messageText = 'My source code can be found at <https://github.com/Dcai169/Rip-Response-Bot>.';
        message.channel.send(messageText);
		return messageText;
	},
};