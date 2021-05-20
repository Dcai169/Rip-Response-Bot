// require('dotenv').config({ path: './config/config.env' });
// import { GoogleSpreadsheet } from 'google-spreadsheet';
import Discord = require('discord.js');
const version = require('../package.json').version

// import destinyResponder = require('./src/responders/DestinyResponder');
// import haloResponder = require('./responders/HaloResponder');
// import warframeResponder = require('./src/responders/WarframeResponder');

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

    // DMR
    await bot.guilds.cache.get('514059860489404417')?.commands.create({
        name: 'search',
        description: 'Search Destiny Models',
        options: [
            {
                name: 'query',
                type: 'STRING',
                description: 'The query to search for.',
                required: true
            },
            {
                name: 'class',
                type: 'STRING',
                description: 'The class to filter by. Applies only to armor.',
                required: false,
                choices: [
                    {
                        name: 'Titan',
                        value: 'titan'
                    },
                    {
                        name: 'Hunter',
                        value: 'hunter'
                    },
                    {
                        name: 'Warlock',
                        value: 'warlock'
                    }
                ]
            },
            {
                name: 'gender',
                type: 'STRING',
                description: 'The gender to filter by. Applies only to armor.',
                required: false,
                choices: [
                    {
                        name: 'Male',
                        value: 'male'
                    },
                    {
                        name: 'Female',
                        value: 'female'
                    }
                ]
            }
        ]
    });

    // HMR
    await bot.guilds.cache.get('671183775454986240')?.commands.create({
        name: 'search',
        description: 'Search Halo Models',
        options: [
            {
                name: 'query',
                type: 'STRING',
                description: 'The query to search for.',
                required: true
            },
            {
                name: 'game',
                type: 'STRING',
                description: 'The game to filter by.',
                required: false,
                choices: [
                    {
                        name: 'Halo CE',
                        value: 'Halo CE'
                    },
                    {
                        name: 'Halo CEA',
                        value: 'Halo CEA'
                    },
                    {
                        name: 'Halo 2 Classic',
                        value: 'Halo 2 Classic'
                    },
                    {
                        name: 'Halo 2 Anniversary',
                        value: 'Halo 2 Anniversary'
                    },
                    {
                        name: 'Halo 2 A Multiplayer',
                        value: 'Halo 2 A Multiplayer'
                    },
                    {
                        name: 'Halo 3',
                        value: 'Halo 3',
                    },
                    {
                        name: 'Halo 3: ODST',
                        value: 'Halo 3: ODST'
                    },
                    {
                        name: 'Halo Reach',
                        value: 'Halo Reach'
                    },
                    {
                        name: 'Halo 4',
                        value: 'Halo 4'
                    },
                    {
                        name: 'Halo 5',
                        value: 'Halo 5'
                    },
                    {
                        name: 'Halo Wars',
                        value: 'Halo Wars'
                    },
                    {
                        name: 'Halo Wars 2',
                        value: 'Halo Wars 2'
                    },
                    {
                        name: 'Halo: Spartan Strike',
                        value: 'Halo: Spartan Strike'
                    }
                ]
            }
        ]
    });

    // WMR
    await bot.guilds.cache.get('724365082787708949')?.commands.create({
        name: 'search',
        description: 'Search Warframe Models',
        options: [
            {
                name: 'query',
                type: 'STRING',
                description: 'The query to search for.',
                required: true
            }
        ]
    });

    await bot.application?.commands.set(commandData);
    
    console.log('Commands registered')
});

bot.on('interaction', async interaction => {
    // If the interaction isn't a slash command, return
    if (!interaction.isCommand()) {
        return;
    }
  
    switch (interaction.commandName) {
        case 'search':
            await interaction.defer();
            switch (interaction.guildID) {
                // Library
                case '705230123745542184':
                    interaction.editReply(JSON.stringify(interaction.options));
                    break;

                // DMR
                case '514059860489404417':
                    interaction.editReply('IMPLEMENTATION PENDING');
                    break;

                // HMR
                case '671183775454986240':
                    interaction.editReply('IMPLEMENTATION PENDING');
                    break;

                // WMR
                case '724365082787708949':
                    interaction.editReply('IMPLEMENTATION PENDING');
                    break;
                
                default:
                    break;
            }
            console.log(interaction.options)
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
