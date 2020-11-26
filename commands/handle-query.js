const { GoogleSpreadsheet } = require('google-spreadsheet');
const levenshtien = require("damerau-levenshtein");
require('dotenv').config({ path: './config.env' });
const doc = new GoogleSpreadsheet('18-pxaUaUvYxACE5uMveCE9_bewwhfbd93ZaLIyP_rxQ');

class itemArray {
    constructor(doc) {
        this.doc = doc;
        this.resetArray() // or create it in this case
        
        const KEY = process.env.GSHEETAPI;
        this.doc.useApiKey(KEY);
        this.loadItemInfo();
    }

    resetArray() {
        this.ready = false;
        this.items = {
            hunterArmor: [],
            titanArmor: [],
            warlockArmor: [],
            elseItems: [],
        };
    }

    async initItemObj(sheet, row) { 
        return { 
            entry: sheet.getCell(row, 0), 
            gender: sheet.getCell(row, 2).formattedValue, 
            aliases: String(sheet.getCell(row, 4).formattedValue).split(", ") 
        }; 
    }

    loadItemInfo(callback=()=>{}) {
        // clear arrays
        this.resetArray();

        // get new data
        this.doc.loadInfo().then(() => {
            this.doc.sheetsByIndex.forEach(sheet => { // for each sheet
                sheet.loadCells().then(() => { // load the sheet
                    for(let key in this.items) { // for each list
                        // console.debug(sheet.title);
                        if (sheet.title.toLowerCase().includes(key.split("Armor").shift())) { // if this sheet is the corresponding list
                            for (let row = 0; row < sheet.rowCount; row++) { // then add the data to the array
                                (async () => {
                                    this.items[key].push(await this.initItemObj(sheet, row));
                                })();
                            }
                        } else {
                            for (let row = 0; row < sheet.rowCount; row++) {
                                (async () => {
                                    this.items.elseItems.push(await (async () => { 
                                        let cell = this.initItemObj(sheet, row);
                                        (await cell).gender = null;
                                        return cell; 
                                    })());
                                })();
                            }
                        }
                    }
                }).then(console.log(`${sheet.title} indexed`));
            });
            // probably needs to be async
            setTimeout(() => { console.log("Ready\n"); this.ready = true; callback(); }, 5 * 1000);
        });
    }


}

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
    if ([514949263403515926n, 682687491899523072n].includes(msg.channel.id)) {
        return true;
    }
    if (!itemsObj.ready) {
        return true;
    }

    return false;
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
            loadSheetItems(() => {message.channel.send("Item Index reloaded.")});
        } else if (["thejudsub", "jud", "banana"].includes(args.toLowerCase())) {
            args = "Servitor";
        } else if (checkAbort(message, args)) { // if someone tries to do ?_the or similar
            return;
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
                    results = results.concat(tagClass(itemsObj.items[key].filter(itemFilter, args), key.split("Armor").shift()));
                }
            } else {
                results = tagClass(itemsObj.items[`${armorClass}Armor`].filter(itemFilter, args), armorClass);
            }

            if (gender) {
                results = results.filter((item) => { return item.gender.toLowerCase() === gender.toLowerCase() });
            }

            // console.debug(`Result: ${result}`);
        } else { // otherwise...
            for(let key in itemsObj.items){
                if (key === "elseItems") {
                    results = results.concat(itemsObj.items.elseItems.filter(itemFilter, args));
                } else {
                    results = results.concat(tagClass(itemsObj.items[key].filter(itemFilter, args), key.split("Armor").shift()));
                }
            }

            // console.debug(results);
        }

        if (results.length === 1) {
            response = (!!results[0] ?
                `The ${(!!gender ? response.gender + " " : "")}${(!!armorClass ? response.armorClass + " " : "")}${String(results[0].entry.formattedValue).trim()} model is ${(results[0].entry.hyperlink ?
                    "available at " + results[0].entry.hyperlink + "." :
                    "not available yet.")}` :
                fallbackResponse(`${(!!gender ? gender : "")} ${(!!armorClass ? armorClass : "")} ${args}`));
        } else if (results.length === 0) {
            response = fallbackResponse(`${(!!gender ? gender + " " : "")}${(!!armorClass ? armorClass + " " : "")}${args}`);
        } else {
            response = "Your query returned multiple results.\n"
            results.forEach((i) => {
                response += `The ${(i.gender ? i.gender + " " : "")}${(i.armorClass ? i.armorClass + " " : "")}${String(i.entry.formattedValue).trim()} model is ${(i.entry.hyperlink ?
                    `available at ${i.entry.hyperlink}.` :
                    "not available yet.")}\n`;
                }
            );
        }
        
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
