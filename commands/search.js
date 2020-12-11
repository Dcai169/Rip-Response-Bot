const baseResponder = require('../responders/BaseResponder.js');
const destinyResponder = require('../responders/DestinyResponder.js');
const haloResponder = require('../responders/HaloResponder.js');
const warframeResponder = require('../responders/WarframeResponder.js');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const evaluateReplace = require('../evaluateReplace.js');

const games = {
    destiny: {
        obj: new destinyResponder(new GoogleSpreadsheet('18-pxaUaUvYxACE5uMveCE9_bewwhfbd93ZaLIyP_rxQ')),
        proto: destinyResponder
    },
    halo: {
        obj: new haloResponder(new GoogleSpreadsheet('11FSNqnAicEaHAXNmzJE7iA9zPPZILwOvK9iBDGuCNHo')),
        proto: haloResponder
    },
    warframe: {
        obj: new warframeResponder(new GoogleSpreadsheet('12GEPZuEBhQozCZjTTYMAQzK9iqAHuOC6zzr_cn5mi8o')),
        proto: warframeResponder
    }
};

function checkAbort(msg, query) { // this function checks if there should be any response at all 
    if (query === '') {
        return true;
    }
    if (msg.channel.nsfw) { // Do not respond in nsfw channels
        return true;
    }

    return false;
}

module.exports = {
    name: 'search',
    description: 'Search',
    args: true,
    usage: '<query>, [<game>]',
    guildOnly: false,
    execute(message, query, game) {
        if (checkAbort(message, query)) { // check if there should be any response
            return;
        }

        if (game && query.trim() === 'reload' && ['191624702614175744', games[game].obj.ownerId].includes(message.author.id)) {
            message.channel.send(`Reloading ${baseResponder.capitalizeWord(game)} indexes. This can take up to a minute.`);
            games[game].obj.loadIndexes(() => {message.channel.send(`${baseResponder.capitalizeWord(game)} indexes reloaded.`)});
            return;
        }

        let response = '';
        if (game) {
            response = baseResponder.respond(games[game].obj.search(message, query), games[game].proto);
        } else {
            Object.values(games).forEach(responder => {
                response += `${evaluateReplace(baseResponder.respond(responder.obj.search(message, query), responder.proto), {replacement: ''})}\n`;
            });
        }

        if (response) {
            response = response.trim(); // remove extra whitespace
            if (response.length >= 2000) { // discord has a limit of 2000 chars per message
                return message.reply('Your query generated a response that is too long!');
            } else if (response === '') {
                return; // Can't send an empty message
            } else {
                return message.channel.send(response);
            }
        }
    }
};
