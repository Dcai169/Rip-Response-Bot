module.exports = {
	name: 'ping', // trigger phrase
	description: 'Ping!',
	execute(message, args) {
		message.channel.send('pong');
	},
};