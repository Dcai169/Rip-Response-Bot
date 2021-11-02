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
const commands: { [key: string]: Discord.ApplicationCommandData[] } = require(`${__dirname}/config/commands.json`);

let destinyResponders = {
    'sheet': new DestinySheetResponder(),
    'drive': new DestinyDriveResponder()
};

let haloResponders = {
    'sheet': new HaloSheetResponder()
};

let warframeResponders = {
    'sheet': new WarframeSheetResponder()
}

let responders = new Map();
responders.set('destiny', destinyResponders);
responders.set('halo', haloResponders);
responders.set('warframe', warframeResponders);

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
bot.login(process.env.TOKEN).then((data) => { console.log(`Logged in with username ${bot.user.tag}`) }, (err) => { console.error(err); });

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
    await bot.guilds.cache.get('705230123745542184')?.commands.create({
        "name": "reload",
        "description": "Reload cached results"
    });

    for (const [guildId, guildCommands] of Object.entries(commands)) {
        await bot.guilds.cache.get(guildId)?.commands.set(guildCommands);
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
        await interaction.deferReply();
        switch (interaction.commandName) {
            case 'search':
                switch (interaction.guildId) {
                    // Library
                    case '705230123745542184':
                        interaction.editReply('Not implemented');
                        break;

                    // DMR
                    case '514059860489404417':
                        switch (interaction.options.getSubcommand()) {
                            case 'sheet':
                                interaction.editReply(BaseResponder.respond(responders.get('destiny').sheet.search((interaction.options.get('query').value as string), { armorClass: (interaction.options.get('class')?.value as string), gender: (interaction.options.get('gender')?.value as string) }), responders.get('destiny').sheet));
                                break;

                            case 'community':
                                interaction.editReply(BaseResponder.respond(responders.get('destiny').drive.search((interaction.options.get('query').value as string), { armorClass: (interaction.options.get('class')?.value as string), gender: (interaction.options.get('gender')?.value as string) }), responders.get('destiny').drive));
                                break;

                            default:
                                break;
                        }
                        break;

                    // HMR
                    case '671183775454986240':
                        interaction.editReply(BaseResponder.respond(responders.get('halo').sheet.search((interaction.options.get('query').value as string), { game: (interaction.options.get('game')?.value as string) }), responders.get('halo').sheet));
                        break;

                    // WMR
                    case '724365082787708949':
                        interaction.editReply(BaseResponder.respond(responders.get('warframe').sheet.search((interaction.options.get('query').value as string)), responders.get('warframe').sheet));
                        break;

                    default:
                        interaction.editReply('IMPLEMENTATION PENDING');
                        console.log(interaction.guildId);
                        console.log(interaction.options);
                        break;
                }
                break;

            case 'reload':
                switch (interaction.guildId) {
                    // Library
                    case '705230123745542184':
                        interaction.editReply('Not implemented');
                        break;

                    // DMR
                    case '514059860489404417':
                        (async () => {
                            await responders.get('destiny').sheet.loadItems();
                            await responders.get('destiny').drive.loadItems('14Ry-piQtH3j6MlfoVLfFfu98c4pcTJUb', '');
                        })().then(() => { interaction.editReply('Destiny items reloaded'); });
                        break;

                    // HMR
                    case '671183775454986240':
                        (async () => {
                            await responders.get('halo').sheet.loadItems();
                        })().then(() => { interaction.editReply('Halo items reloaded'); });
                        break;

                    // WMR
                    case '724365082787708949':
                        (async () => {
                            await responders.get('warframe').sheet.loadItems();
                        })().then(() => { interaction.editReply('Warframe items reloaded'); });
                        break;

                    default:
                        break;
                }
                break;

            case 'about':
                interaction.editReply('I am The Librarian. I was built to serve the patrons of this server in their quest for models. If you need me, use the \`search\` command, and I\'ll do my best to find them for you. If you find an error, contact my creator, Alcidine#5154.');
                break;

            case 'bots-promise':
                interaction.editReply((Math.random() >= 0.5 ? 'My purpose is to suck Jud\'s toes.' : 'My purpose is to serve the patrons of this server.'));
                break;

            case 'source':
                interaction.editReply('My source code can be found at <https://github.com/Dcai169/Rip-Response-Bot>.');
                break;

            default:
                console.log(interaction.options);
                break;
        }
    } catch (error) {
        interaction.editReply(`The system encountered error: ${error.stack}`);
        console.error(error.stack);
    }
});

console.log()