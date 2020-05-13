module.exports = {
	name: 'bots-promise', // trigger phrase
	description: 'States the promise',
	execute(message, args) {
        message.channel.send('I will not tell lies.');
		return 'I will not tell lies.';
	},
};