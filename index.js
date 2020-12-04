const fs = require('fs');
require('dotenv').config({ path: './config/config.env' });
const Discord = require('discord.js');
const bot = new Discord.Client();
bot.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

const stripRegEx = require('./redrix.js').stripRegEx;
const searchCmd = require('./commands/search.js');

function errorResponse(err, msg, errCode = undefined) {
  console.error(err);
  msg.reply('There was an error trying to execute that command!' + (!!errCode ? ` Error Code: ${errCode}` : ""));
}

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);

  // set a new item in the Collection
  // with the key as the command name and the value as the exported module
  bot.commands.set(command.name, command);
}

// Login with the bot token
const TOKEN = process.env.TOKEN;
bot.login(TOKEN).then((data) => { console.log(`Logged in with username ${bot.user.tag} (ID: ${bot.user.id})`) }, (err) => { console.error(err); });

bot.on('ready', () => {
  console.info('Connected to Discord');
});

bot.on('message', msg => {
  let startTime = new Date();
  let stopTime = undefined;
  // const args = msg.content.split(/ +/);
  // const commandName = args.shift().toLowerCase();
  const args = msg.content.split(process.env.CMD_PREFIX);
  args.shift(); // remove args[0] which is ""
  const commandName = String(args.shift()).toLowerCase();

  let query = null;
  if (msg.author.id !== bot.user.id) {
    query = stripRegEx(msg.content);
    if (!Array.isArray(query) && query) {
      query = [query];
    }
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

    // execute the command
    try {
      console.log(command.execute(msg, args));
      stopTime = new Date();
      console.log(`Responded in ${stopTime - startTime}ms`);  
    } catch (error) {
      errorResponse(error, msg);
    }
    return;

  } else if (query) { // if the filters found something
    try {
      query.forEach((queryI) => {
        // Execute search command
        if (queryI) {
          console.log(`User ${msg.author.tag} (ID: ${msg.author.id}) in ${(!!msg.guild ? `channel \#${msg.channel.name} (Chnl ID: ${msg.channel.id}) of server ${msg.guild.name}` : `a Direct Message`)} requested "${(!!queryI.gender ? queryI.gender + " " : "")}${(!!queryI.armorClass ? queryI.armorClass + " " : "")}${queryI.query}"`);
          console.log(searchCmd.execute(msg, queryI.query, queryI.armorClass, queryI.gender));
          stopTime = new Date();
          console.log(`Responded in ${stopTime - startTime}ms`);
          console.log();
          return;
        }
      });
    } catch (error) {
      errorResponse(error, msg);
    }
  }
});
