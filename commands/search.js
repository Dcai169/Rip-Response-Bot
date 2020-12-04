const destinyResponder = require("../responders/DestinyResponder.js");
const haloResponder = require("../responders/HaloResponder.js");
const { GoogleSpreadsheet } = require('google-spreadsheet');
const fs = require('fs');

const destiny = new destinyResponder(new GoogleSpreadsheet('18-pxaUaUvYxACE5uMveCE9_bewwhfbd93ZaLIyP_rxQ'));
const halo = new haloResponder(new GoogleSpreadsheet('11FSNqnAicEaHAXNmzJE7iA9zPPZILwOvK9iBDGuCNHo'));

function checkAbort(msg, query) { // this function checks if there should be any response at all 
    if (query === "") {
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
        if (checkAbort(message, query)) {
            return;
        }

        let response = "";
        if (game) {
            if (game === "destiny") {
                response = destinyResponder.respond(destiny.search(message, query));
            } else if (game === "halo") {
                response = haloResponder.respond(halo.search(message, query));
            } else {
                response = `${destinyResponder.respond(destiny.search(message, query))}\n${haloResponder.respond(halo.search(message, query))}`;
            }
        }

        if (response) {
            response = response.trim(); // remove extra whitespace
            if (response.length >= 2000) { // discord has a limit of 2000 chars per message
                message.reply('Your query generated a response that is too long!');
            } else {
                message.channel.send(response);
            }
        }
        return response;
    },
};
