const { GoogleSpreadsheet } = require('google-spreadsheet');
const levenshtien = require("damerau-levenshtein");
require('dotenv').config({ path: './config.env' });
const doc = new GoogleSpreadsheet('18-pxaUaUvYxACE5uMveCE9_bewwhfbd93ZaLIyP_rxQ');

let elseItems = [];
let warlockArmor = [];
let hunterArmor = [];
let titanArmor = [];

const KEY = process.env.GSHEETAPI;

async function initItemObj(sheet, row) { return { entry: sheet.getCell(row, 0), gender: sheet.getCell(row, 2).formattedValue, aliases: sheet.getCell(row, 4).formattedValue.split(", ") }; }

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

// function fallbackResponse(query) {
//     return (!!query ? `The ${query} model was not found.` : "Your query did not return a valid result.") +
//         "\n#frequently-asked-questions #2 \nYou can check the Google Drive first, but if it isn't there you can learn to rip yourself! Learn more here: <https://discordapp.com/channels/514059860489404417/592620141909377026/684604120820482087> \nThere's a guide on how to rip from the game too if it's a boss or environment asset you need: <http://bit.ly/36CI6d8>";
// }
function fallbackResponse(query) { return }

async function loadSheetItems(callback=()=>{}){ // if unspecified the callback is an anonymous function that does nothing
    // clear arrays
    elseItems = [];
    warlockArmor = [];
    hunterArmor = [];
    titanArmor = [];

    // get new data
    doc.loadInfo().then(() => {
        doc.sheetsByIndex.forEach(sheet => {
            sheet.loadCells().then(() => {
                (async function () {
                    if (sheet.title.toLowerCase().includes("hunter")) {
                        for (let row = 0; row < sheet.rowCount; row++) {
                            hunterArmor.push(await initItemObj(sheet, row));
                        }
                        // console.debug(hunterArmor);
                    } else if (sheet.title.toLowerCase().includes("warlock")) {
                        for (let row = 0; row < sheet.rowCount; row++) {
                            warlockArmor.push(await initItemObj(sheet, row));
                        }
                        // console.debug(warlockArmor);
                    } else if (sheet.title.toLowerCase().includes("titan")) {
                        for (let row = 0; row < sheet.rowCount; row++) {
                            titanArmor.push(await initItemObj(sheet, row));
                        }
                        // console.debug(titanArmor);
                    } else {
                        for (let row = 0; row < sheet.rowCount; row++) {
                            elseItems.push(await (async function () { return { entry: sheet.getCell(row, 0), gender: null }; })());
                        }
                        // console.debug(elseItems);
                    }
                })().then(() => console.log(`${sheet.title} indexed`));
            });
        });
        setTimeout(() => { console.log("Ready\n"); callback(); }, 5 * 1000);
    });
}

process.on('unhandledRejection', (_, error) => {
    // console.log("Google Sheet API failed to connect.");
    // console.log(error)
    // process.kill(process.pid, 'SIGTERM');
    console.log("This error is safe to ignore.");
})

doc.useApiKey(KEY);
loadSheetItems();

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
        } else if (args === "") { // if someone tries to do ?_the or similar
            return;
        }

        // console.debug(`Args: ${args}`);

        if (!!armorClass || !!gender) {
            let result = null;
            try {
                armorClass = armorClass.toLowerCase();
            } catch (err) {
                // Let the error go wild and free
            }

            if (!armorClass) {
                result = [];
                result = result.concat(tagClass(warlockArmor.filter(itemFilter, args), "Warlock"));
                result = result.concat(tagClass(titanArmor.filter(itemFilter, args), "Titan"));
                result = result.concat(tagClass(hunterArmor.filter(itemFilter, args), "Hunter"));
            } else if (armorClass === "hunter") {
                result = tagClass(hunterArmor.filter(itemFilter, args), "Hunter");
            } else if (armorClass === "warlock") {
                result = tagClass(warlockArmor.filter(itemFilter, args), "Warlock");
            } else if (armorClass === "titan") {
                result = tagClass(titanArmor.filter(itemFilter, args), "Titan");
            }

            if (gender) {
                result = result.filter((item) => { return item.gender.toLowerCase() === gender.toLowerCase() });
            }

            // console.debug(`Result: ${result}`);

            if (result.length === 1) {
                response = (!!result[0] ?
                    `The ${(!!gender ? response.gender + " " : "")}${(!!armorClass ? response.armorClass + " " : "")}${String(result[0].entry.formattedValue).trim()} model is ${(result[0].entry.hyperlink ?
                        "available at " + result[0].entry.hyperlink + "." :
                        "not available yet.")}` :
                    fallbackResponse(`${(!!gender ? gender : "")} ${(!!armorClass ? armorClass : "")} ${args}`));
            } else if (result.length === 0) {
                response = fallbackResponse(`${(!!gender ? gender + " " : "")}${(!!armorClass ? armorClass + " " : "")}${args}`);
            } else {
                response = "Your query returned multiple results.\n"
                result.forEach((i) => {
                    response += `The ${(i.gender ? i.gender + " " : "")}${(i.armorClass ? i.armorClass + " " : "")}${String(i.entry.formattedValue).trim()} model is ${(i.entry.hyperlink ?
                        `available at ${i.entry.hyperlink}.` :
                        "not available yet.")}\n`;
                    }
                );
            }
        } else {
            let result = elseItems.filter(itemFilter, args);
            result = result.concat(tagClass(warlockArmor.filter(itemFilter, args), "Warlock"));
            result = result.concat(tagClass(titanArmor.filter(itemFilter, args), "Titan"));
            result = result.concat(tagClass(hunterArmor.filter(itemFilter, args), "Hunter"));

            // console.debug(result);

            if (result.length === 1) {
                response = (!!result[0] ?
                    `The ${String(result[0].entry.formattedValue).trim()} model is ${(result[0].entry.hyperlink ?
                        "available at " + result[0].entry.hyperlink + "." :
                        "not available yet.")}` :
                    fallbackResponse(args));
            } else if (result.length === 0) {
                response = fallbackResponse(args);
            } else {
                response = "Your query returned multiple results.\n"
                result.forEach((i) => {
                    response += `The ${(!!i.gender ? i.gender + " " : "")}${(!!i.armorClass ? i.armorClass + " " : "")}${String(i.entry.formattedValue).trim()} model is ${(i.entry.hyperlink ?
                        `available at ${i.entry.hyperlink}.` :
                        "not available yet.")}\n`;
                }
                );
            }
        }
        
        if (response) {
            if (response.length >= 2000) { // discord has a limit of 2000 chars per message
                message.reply('There was an error trying to execute that command!');
            } else { 
                message.channel.send((!!response ? response : fallbackResponse()));
            }
        }
        // message.channel.send((!!response ? response : fallbackResponse()));
        return response;
    },
};
