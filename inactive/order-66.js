module.exports = {
	name: 'order-66', // trigger phrase
	description: 'Executes order 66',
	execute(message, args) {
        message.channel.send('Yes my Lord.');
		return 'Yes my Lord.';
	},
};