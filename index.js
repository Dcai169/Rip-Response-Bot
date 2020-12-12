// require('dotenv').config({ path: './config/config.env' });
const Discord = require('discord.js');
const express = require('express');
const fs = require('fs');
const version = require('./package.json').version
// const evaluateReplace = require('./evaluateReplace.js');
const parseQuery = require('./redrix.js').parseQuery;
const searchCmd = require('./commands/search.js');
const bot = new Discord.Client({ presence: { activity: { name: version, type: 'PLAYING' } } });
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// Express Config
const web = express();
const PORT = process.env.PORT || 3000;

web.get('/', (req, res) => {
    res.send('Hello World!');
});

web.get('/auth', (req, res) => {
    res.send('OAuth2 Flow Completed');
});

web.listen(PORT, () => {
    console.log(`Express running on port ${PORT}`);
});

function errorResponse(err, msg, errCode = undefined) {
    console.error(err);
    msg.reply('There was an error trying to execute that command!' + (!!errCode ? ` Error Code: ${errCode}` : ''));
}

bot.commands = new Discord.Collection();
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
    args.shift(); // remove args[0] which is ''
    const commandName = String(args.shift()).toLowerCase();

    let query = null;
    if (msg.author.id !== bot.user.id) {
        query = parseQuery(msg.content, msg);
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
        } catch (error) {
            errorResponse(error, msg);
        } finally {
            stopTime = new Date();
            console.log(`Responded in ${stopTime - startTime}ms`);
            console.log();
            return;
        }

    } else if (query) { // if the filters found something
        try {
            query.forEach((queryI) => {
                // Execute search command
                if (queryI) {
                    console.log(`User ${msg.author.tag} (ID: ${msg.author.id}) in ${(!!msg.guild ? `channel \#${msg.channel.name} (Chnl ID: ${msg.channel.id}) of server ${msg.guild.name}` : `a Direct Message`)} requested '${queryI.queryText}' of game ${queryI.game}`);
                    console.log(searchCmd.execute(msg, queryI.queryText, queryI.game));
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
