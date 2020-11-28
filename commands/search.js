const levenshtien = require("damerau-levenshtein");
const itemArray = require("./../index_generator.js");
const { GoogleSpreadsheet } = require('google-spreadsheet');
const doc = new GoogleSpreadsheet('18-pxaUaUvYxACE5uMveCE9_bewwhfbd93ZaLIyP_rxQ');
const fs = require('fs');
const queryOverrides = JSON.parse(fs.readFileSync('./config/query_overrides.json', 'utf8'));

const itemsObj = new itemArray(doc);

function itemFilter(cell) {
    return levenshtien((!!cell.entry.formattedValue ? // if the cell's formattedValue exists i.e. is not empty
        cell.entry.formattedValue.toLowerCase().replace(/(\W)?$/gmi, "").replace(/\b((the\s)?((an?)\s)?(is)?){1}\b/gi, "") : // if it does exist, do more filtering
        ""), this.toLowerCase()).similarity > process.env.SIMILARITY_THRESHOLD // the Damerau-Levenshtien distance must greater than the specified number
        || cell.aliases.includes(this.toLowerCase()); // or if the query matches the alias
}

function tagClass(filterResults, tag) {
    filterResults.forEach((item) => { item.armorClass = tag; });
    return filterResults;
}

function checkAbort(msg, args) { // this function checks if there should be any response at all 
    if (args === "") {
        return true;
    }
    if (["514949263403515926", "682687491899523072"].includes(msg.channel.id)) {
        return true;
    }
    if (!itemsObj.ready) {
        return true;
    }

    return false;
}

function capitalizeWord(word) {
    if (typeof word !== 'string') {return ''}
    return word.charAt(0).toUpperCase() + word.slice(1);
}

function generateQualifiers(gender, armorClass) {
    return `${(!!gender ? gender + " " : "")}${(!!armorClass ? capitalizeWord(armorClass) + " " : "")}`;
}

function generateFullyQualifiedName(responseItem) {
    return `${generateQualifiers(responseItem.gender, responseItem.armorClass)}${String(responseItem.entry.formattedValue).trim()}`;
}

// function fallbackResponse(query) {
//     return (!!query ? `The ${query} model was not found.` : "Your query did not return a valid result.") +
//         "\n#frequently-asked-questions #2 \nYou can check the Google Drive first, but if it isn't there you can learn to rip yourself! Learn more here: <https://discordapp.com/channels/514059860489404417/592620141909377026/684604120820482087> \nThere's a guide on how to rip from the game too if it's a boss or environment asset you need: <http://bit.ly/36CI6d8>";
// }
function fallbackResponse(query) { return }

module.exports = {
    name: 'handle-query',
    description: 'Handle query given',
    args: true,
    usage: '<query>, [<class>, [<gender>]]',
    guildOnly: false,
    execute(message, args, armorClass, gender) {
        /* 
        message: Message object as described by the discord.js library.
        args: The query the user searched.
        armorClass: Class of the armor, if specified. null otherwise.
        gender: Gender of the armor, if specified. null otherwise.
        */

        let response = null;

        // Baked in commands
        if (args.toLowerCase() === "reload" && ["Thejudsub#7823", "MrTrainCow#5154"].includes(message.author.tag)) {
            message.channel.send("Reloading Item Index. This can take up to a minute.");
            itemsObj.loadItemInfo(() => {message.channel.send("Item Index reloaded.")});
        } else if (checkAbort(message, args)) { // if someone tries to do ?_the or similar
            return;
        } else {
            queryOverrides.forEach((overridePair) => {
                if (overridePair.replaces.includes(args.toLowerCase())) {
                    args = overridePair.replacement;
                }
            });
        }

        let results = [];
        if (!!armorClass || !!gender) { // if a class or gender is specified
            try {
                armorClass = armorClass.toLowerCase();
            } catch (err) {
                // Let the error go wild and free
            }

            if (!armorClass) {
                for(let key in itemsObj.items){
                    results = results.concat(tagClass(itemsObj.items[key].filter(itemFilter, args), (key.toLowerCase().includes('armor') ? key.split("Armor").shift() : null)));
                }
            } else {
                results = tagClass(itemsObj.items[`${armorClass}Armor`].filter(itemFilter, args), armorClass);
            }

            if (gender) {
                results = results.filter((item) => { 
                    if (!item.gender) { return true }
                    return item.gender.toLowerCase() === gender.toLowerCase() 
                });
            }

        } else { // otherwise...
            for(let key in itemsObj.items){
                if (key === "elseItems") {
                    results = results.concat(itemsObj.items.elseItems.filter(itemFilter, args));
                } else {
                    results = results.concat(tagClass(itemsObj.items[key].filter(itemFilter, args), key.split("Armor").shift()));
                }
            }
        }

        // generate response text
        if (results.length === 1) {
            response = (!!results[0] ?
                `The ${generateFullyQualifiedName(results[0])} model is ${(results[0].entry.hyperlink ?
                    `available at <${results[0].entry.hyperlink}>.` :
                    "not available yet.")}` :
                fallbackResponse(`${generateQualifiers(results[0].gender, results[0].armorClass)}${args}`));
        } else if (results.length === 0) {
            response = fallbackResponse(`${generateQualifiers(gender, armorClass)}${args}`);
        } else {
            response = "Your query returned multiple results.\n"
            results.forEach((i) => {
                response += `The ${generateFullyQualifiedName(i)} model is ${(i.entry.hyperlink ?
                    `available at <${i.entry.hyperlink}>.` :
                    "not available yet.")}\n`;
                }
            );
        }
        
        response = response.trim();
        if (response) {
            if (response.length >= 2000) { // discord has a limit of 2000 chars per message
                message.reply('Your query generated a response that is too long!');
            } else { 
                message.channel.send((!!response ? response : fallbackResponse()));
            }
        }
        // message.channel.send((!!response ? response : fallbackResponse()));
        return response;
    },
};
