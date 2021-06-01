import Discord = require('discord.js');
import * as dotenv from 'dotenv';
import { BaseResponder } from './responders/BaseResponder';
import { WarframeResponder } from './responders/WarframeResponder';
import { DestinyResponder } from './responders/DestinyResponder';
import { HaloResponder } from './responders/HaloResponder';
dotenv.config({ path: `${__dirname}/config/config.env` });
const version = require('../package.json').version
const commands: {[key: string]: Discord.ApplicationCommandData[]} = JSON.parse(require('fs').readFileSync(`${__dirname}/config/commands.json`, 'utf8'))

// import destinyResponder = require('./src/responders/DestinyResponder');
// import haloResponder = require('./responders/HaloResponder');

let responders: { [key: string]: BaseResponder } = {
    'destiny': new DestinyResponder(),
    'halo': new HaloResponder(),
    'warframe': new WarframeResponder()
}

const bot = new Discord.Client({
    presence: {
        status: 'online',
        afk: false,
        activities: [{
            name: version,
            type: 'PLAYING'
        }]
    },
    intents: ['GUILDS', 'GUILD_MESSAGES']
});

// Login with the bot token
bot.login(process.env.TOKEN).then((data) => { console.log(`Logged in with username ${bot.user.tag} (ID: ${bot.user.id})`) }, (err) => { console.error(err); });

bot.on('ready', async () => {
    console.info('Connected to Discord');

    const commandData = [
        {
            name: 'about',
            description: 'Information about this bot.'
        },
        {
            name: 'source',
            description: 'Information on source code.'
        }
    ];

    // Library
    // await bot.guilds.cache.get('705230123745542184')?.commands.create();

    for (const [guildID, guildCommands] of Object.entries(commands)) {
        await bot.guilds.cache.get(guildID)?.commands.set(guildCommands)
    }

    await bot.application?.commands.set(commandData);

    console.log('Commands registered');

    console.log('Ready');
});

bot.on('interaction', async interaction => {
    // If the interaction isn't a slash command, return
    if (!interaction.isCommand()) {
        return;
    }

    switch (interaction.commandName) {
        case 'search':
            await interaction.defer();
            let options: Map<string, string> = new Map(interaction.options.map((option) => { return [option.name, (option.value as string)] }));
            switch (interaction.guildID) {
                // Library
                case '705230123745542184':
                    interaction.editReply('IMPLEMENTATION PENDING');
                    break;

                // DMR
                case '514059860489404417':
                    interaction.editReply(BaseResponder.respond(responders.destiny.search(options.get('query'), { armorClass: options.get('class'), gender: options.get('gender') }), responders.destiny));
                    break;

                // HMR
                case '671183775454986240':
                    interaction.editReply(BaseResponder.respond(responders.halo.search(options.get('query'), { game: options.get('game') }), responders.halo));
                    break;

                // WMR
                case '724365082787708949':
                    interaction.editReply(BaseResponder.respond(responders.warframe.search(options.get('query')), responders.warframe));
                    break;

                default:
                    interaction.editReply('IMPLEMENTATION PENDING');
                    console.log(interaction.guildID);
                    console.log(interaction.options);
                    break;
            }
            break;

        case 'about':
            interaction.reply('I am The Librarian. I was built to serve the patrons of this server in their quest for models. If you need me, use the \`search\` command, and I\'ll do my best to find them for you. If you find an error, contact my creator, MrTrainCow#5154.');
            break;

        case 'bots-promise':
            interaction.reply((Math.random() >= 0.5 ? 'My purpose is to suck Jud\'s toes.' : 'My purpose is to serve the patrons of this server.'));
            break;

        case 'source':
            interaction.reply('My source code can be found at <https://github.com/Dcai169/Rip-Response-Bot>.');
            break;

        default:
            break;
    }
});

// bot.on('message', msg => {

// });
