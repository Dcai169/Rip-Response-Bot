module.exports = {
	name: 'bots-purpose', // trigger phrase
	description: 'States the purpose',
	execute(message, args) {
		let retdat = (Math.random() >= 0.5 ? 'My purpose is to suck Jud\'s toes.' : 'My purpose is to serve the patrons of this server.');
        message.channel.send(retdat);
		return retdat;
	},
};