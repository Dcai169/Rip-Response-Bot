import * as Discord from 'discord.js';
import * as dotenv from 'dotenv';
import { BaseResponder } from './responders/BaseResponder';
import { WarframeSheetResponder } from './responders/WarframeSheetResponder';
import { DestinySheetResponder } from './responders/DestinySheetResponder';
import { HaloSheetResponder } from './responders/HaloSheetResponder';
import { DestinyDriveResponder } from './responders/DestinyDriveResponder';
// import { HaloDriveResponder } from './responders/HaloDriveResponder';
dotenv.config({ path: `${__dirname}/config/config.env` });
const version = require('../package.json').version;
const commands: {[key: string]: Discord.ApplicationCommandData[]} = require(`${__dirname}/config/commands.json`);

let responders = {
    'destiny': [new DestinySheetResponder(), new DestinyDriveResponder()],
    'halo': [new HaloSheetResponder()],
    'warframe': [new WarframeSheetResponder()]
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

    for (const [guildId, guildCommands] of Object.entries(commands)) {
        await bot.guilds.cache.get((guildId as `${bigint}`))?.commands.set(guildCommands);
    }

    await bot.application?.commands.set(commandData);

    console.log('Commands registered');

    console.log('Ready');
});

bot.on('interactionCreate', async interaction => {
    // If the interaction isn't a slash command, return
    if (!interaction.isCommand()) {
        return;
    }
    try {
        switch (interaction.commandName) {
            case 'search':
                await interaction.defer();
                switch (interaction.guildId) {
                    // Library
                    case '705230123745542184':
                        interaction.editReply('Not implemented');
                        break;
    
                    // DMR
                    case '514059860489404417':                        
                        switch ([...interaction.options.keys()][0]) {
                            case 'sheet':
                                interaction.editReply(BaseResponder.respond(responders.destiny[0].search((interaction.options.get('sheet').options.get('query').value as string), { armorClass: (interaction.options.get('sheet').options.get('class').value as string), gender: (interaction.options.get('sheet').options.get('gender').value as string) }), responders.destiny[0]));
                                break;
    
                            case 'community':
                                interaction.editReply(BaseResponder.respond(responders.destiny[1].search((interaction.options.get('community').options.get('query').value as string), { armorClass: (interaction.options.get('community').options.get('class').value as string), gender: (interaction.options.get('community').options.get('gender').value as string) }), responders.destiny[1]));
                                break;
                        
                            default:
                                break;
                        }
                        break;
    
                    // HMR
                    case '671183775454986240':
                        interaction.editReply(BaseResponder.respond(responders.halo[0].search((interaction.options.get('query').value as string), { game: (interaction.options.get('game').value as string) }), responders.halo[0]));
                        break;
    
                    // WMR
                    case '724365082787708949':
                        interaction.editReply(BaseResponder.respond(responders.warframe[0].search((interaction.options.get('query').value as string)), responders.warframe[0]));
                        break;
    
                    default:
                        interaction.editReply('IMPLEMENTATION PENDING');
                        console.log(interaction.guildId);
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
                console.table(interaction);
                break;
        }
    } catch (error) {
        interaction.editReply(`The system encountered an error: ${error}`);
    }
});

console.log()