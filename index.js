const fs = require('fs');
require('dotenv').config({path: './config.env'});
const Discord = require('discord.js');
const bot = new Discord.Client();
bot.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);

	// set a new item in the Collection
	// with the key as the command name and the value as the exported module
	bot.commands.set(command.name, command);
}

// Login with the bot token
const TOKEN = process.env.TOKEN;
bot.login(TOKEN);

const preRegEx = /^has\sany(one|body)\sripped\s(the)?(\s)?/gmi;
const sufRegEx = /(\syet)?(.)?$/gmi; // y no work?

bot.on('ready', () => {
    console.info(`Logged in with username ${bot.user.tag} and id ${bot.user.id}`);
});

bot.on('message', msg => {
    const args = msg.content.split(/ +/);
    const commandName = args.shift().toLowerCase();
    // console.info(`Called command: ${commandName}`);

    // Handle if the command exists
    if (bot.commands.has(commandName)) {
      const command = bot.commands.get(commandName);

      // Handle arguments to a command
      if (command.args && !args.length) {
          return msg.channel.send(`You didn't provide any arguments, ${msg.author}!`);
      }

      // Handle whether commands should be used in DMs
      if (command.guildOnly && msg.channel.type !== 'text') {
          return msg.reply('I can\'t execute that command inside DMs!');
      }
      
      try {
        console.log(command.execute(msg, args));
      } catch (error) {
        console.error(error);
        msg.reply('there was an error trying to execute that command!');
      }
    // handle regex filtered strings
    } else if (preRegEx.test(msg.content)) {
      let query = msg.content.replace(preRegEx, "")
      console.debug(query);
      query.replace(sufRegEx, "");
      console.debug(query);
      try {
        console.log(bot.commands.get('handle-query').execute(msg, query));
      } catch (error) {
        console.error(error);
        msg.reply('there was an error trying to execute that command!');
      }
    }
  });