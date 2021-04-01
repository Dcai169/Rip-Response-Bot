const env = process.env.NODE_ENV || 'development';
const fs = require('fs');
const log = require('pino')();

const Discord = require('discord.js');
const { CommandoClient } = require('discord.js-commando');

const client = CommandoClient({ commandPrefix: '?_', owner: '191624702614175744', invite: 'https://discord.gg/9KWKcEfg' });
// client.registry;

// const bot = new Discord.Client({ presence: { activity: { name: require('./package.json').version, type: 'PLAYING' } } });
// const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

const parseQuery = require('./redrix.js').parseQuery;
const searchCmd = require('./commands/search.js');

if (env === 'development') {
    require('dotenv').config({ path: './config/config.env' });
}

function errorResponse(err, msg, errCode) {
    log.error(err);
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
bot.login(TOKEN).then((data) => { log.info(`Logged in with username ${bot.user.tag} (ID: ${bot.user.id})`) }, (err) => { log.error(err); });

bot.on('ready', () => {
    log.info('Connected to Discord');
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
    } else { // do not respond to self
        // record the message and channel id somewhere
        return;
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
            log.info(command.execute(msg, args));
        } catch (error) {
            errorResponse(error, msg);
        } finally {
            stopTime = new Date();
            log.debug(`Responded in ${stopTime - startTime}ms`);
            return;
        }

    } else if (query) { // if the filters found something
        try {
            query.forEach((queryI) => {
                // Execute search command
                if (queryI) {
                    log.trace(`User ${msg.author.tag} (ID: ${msg.author.id}) in ${(!!msg.guild ? `channel \#${msg.channel.name} (Chnl ID: ${msg.channel.id}) of server ${msg.guild.name}` : `a Direct Message`)} requested '${queryI.queryText}' of game ${queryI.game}`);
                    log.info(searchCmd.execute(msg, queryI.queryText, queryI.game));
                    stopTime = new Date();
                    log.debug(`Responded in ${stopTime - startTime}ms`);
                    return;
                }
            });
        } catch (error) {
            errorResponse(error, msg);
        }
    }
});
