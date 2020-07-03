const fs = require('fs');
require('dotenv').config({ path: './config.env' });
const Discord = require('discord.js');
const bot = new Discord.Client();
bot.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const stripRegEx = require('./redrix.js').stripRegEx;

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);

  // set a new item in the Collection
  // with the key as the command name and the value as the exported module
  bot.commands.set(command.name, command);
}

// Login with the bot token
const TOKEN = process.env.TOKEN;
bot.login(TOKEN).then((data) => {console.log(`Logged in with username ${bot.user.tag} with id ${bot.user.id}`)}, (err) => {console.error(err);});

bot.on('ready', () => {
  console.info('Connected to Discord');
});

bot.on('message', msg => {
  const args = msg.content.split(/ +/);
  const commandName = args.shift().toLowerCase();

  let query = null;
  if (msg.author.id !== bot.user.id) {
    query = stripRegEx(msg.content);
  }

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
  } else if (query) {
    try {
      // console.debug(query);
      console.log(`User ${msg.author.tag} (ID: ${msg.author.id}) in channel \#${msg.channel.name} of server ${msg.guild.name} requested "${(!!query.gender ? query.gender + " " : "")}${(!!query.armorClass ? query.armorClass + " " : "")}${query.query}"`);
      console.log(bot.commands.get('handle-query').execute(msg, query.query, query.armorClass, query.gender));
      console.log();
    } catch (error) {
      console.error(error);
      msg.reply('there was an error trying to execute that command!');
    }
  } else {
    // Joke canned responses
    if (msg.content.toLowerCase() === `${process.env.NAME.toLowerCase()}, what is your promise?`) {
      try {
        console.log(bot.commands.get('bots-promise').execute(msg, args));
        console.log();
      } catch (error) {
        console.error(error);
        msg.reply('there was an error trying to execute that command!');
      }
    } else if (msg.content.toLowerCase() === `${process.env.NAME.toLowerCase()}, what is your purpose?`) {
      try {
        console.log(bot.commands.get('bots-purpose').execute(msg, args));
        console.log();
      } catch (error) {
        console.error(error);
        msg.reply('there was an error trying to execute that command!');
      }
    } else if (msg.content.toLowerCase() === `${process.env.NAME.toLowerCase()}, execute order 66.`) {
      try {
        console.log(bot.commands.get('order-66').execute(msg, args));
        console.log();
      } catch (error) {
        console.error(error);
        msg.reply('there was an error trying to execute that command!');
      }
    }
  }
});