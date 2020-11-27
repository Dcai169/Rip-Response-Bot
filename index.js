const fs = require('fs');
require('dotenv').config({ path: './config/config.env' });
const Discord = require('discord.js');
const bot = new Discord.Client();
bot.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

const stripRegEx = require('./redrix.js').stripRegEx;
const searchCmd = require('./commands/search.js');

function errorResponse(err, msg, errCode=undefined){
  console.error(err);
  msg.reply('There was an error trying to execute that command!'+(!!errCode ? ` Error Code: ${errCode}` : ""));
}

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);

  // set a new item in the Collection
  // with the key as the command name and the value as the exported module
  bot.commands.set(command.name, command);
}

// Login with the bot token
const TOKEN = process.env.TOKEN;
bot.login(TOKEN).then((data) => {console.log(`Logged in with username ${bot.user.tag} (ID: ${bot.user.id})`)}, (err) => {console.error(err);});

bot.on('ready', () => {
  console.info('Connected to Discord');
});

bot.on('message', msg => {
  // const args = msg.content.split(/ +/);
  // const commandName = args.shift().toLowerCase();
  const args = msg.content.split('?_');
  args.shift(); // remove args[0] which is ""
  const commandName = String(args.shift()).toLowerCase();

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

    // execute the command
    try {
      console.log(command.execute(msg, args));
      return;
    } catch (error) {
      errorResponse(error, msg);
    }
  
  } else if (query) { // if the filters found something
    try {
      // Execute search command
      console.log(`User ${msg.author.tag} (ID: ${msg.author.id}) in ${(!!msg.guild ? `channel \#${msg.channel.name} (Chnl ID: ${msg.channel.id}) of server ${msg.guild.name}` : `a Direct Message`)} requested "${(!!query.gender ? query.gender + " " : "")}${(!!query.armorClass ? query.armorClass + " " : "")}${query.query}"`);
      console.log(searchCmd.execute(msg, query.query, query.armorClass, query.gender));
      console.log();
    } catch (error) {
      errorResponse(error, msg);
    }
  }
});
