const fs = require('fs');
const BaseResponder = require('./BaseResponder.js');
const removeArticles = require('../redrix.js').removeArticles;
const queryOverrides = JSON.parse(fs.readFileSync('./config/query_overrides.json', 'utf8'));

class DestinyResponder extends BaseResponder {
    constructor(doc) {
        super(doc);
    }

    // INDEXING
    resetIndexes() {
        this.ready = false;
        this.items = {
            hunterArmor: [],
            titanArmor: [],
            warlockArmor: [],
            elseItems: [],
        };
    }

    async createItemObj(sheet, row) {
        return {
            entry: sheet.getCell(row, 0),
            gender: sheet.getCell(row, 2).formattedValue,
            aliases: (sheet.getCell(row, 3).formattedValue ? sheet.getCell(row, 3).formattedValue.split(", ").map(removeArticles) : [])
        };
    }

    loadIndexes(callback = () => { }) {
        // clear arrays
        this.resetIndexes();

        // start timer
        let startTime = new Date();
        let stopTime = undefined;

        // get new data
        this.doc.loadInfo().then(() => {
            this.doc.sheetsByIndex.forEach(sheet => { // for each sheet
                sheet.loadCells().then(() => { // load the sheet
                    switch (sheet.title.toLowerCase().split(" ").shift()) {
                        case "hunter":
                            for (let row = 0; row < sheet.rowCount; row++) { // then add the data to the array
                                (async () => {
                                    this.items.hunterArmor.push(await this.createItemObj(sheet, row));
                                })();
                            }
                            break;

                        case "warlock":
                            for (let row = 0; row < sheet.rowCount; row++) { // then add the data to the array
                                (async () => {
                                    this.items.warlockArmor.push(await this.createItemObj(sheet, row));
                                })();
                            }
                            break;

                        case "titan":
                            for (let row = 0; row < sheet.rowCount; row++) { // then add the data to the array
                                (async () => {
                                    this.items.titanArmor.push(await this.createItemObj(sheet, row));
                                })();
                            }
                            break;

                        default:
                            for (let row = 0; row < sheet.rowCount; row++) {
                                (async () => {
                                    this.items.elseItems.push(await (async () => {
                                        let cell = this.createItemObj(sheet, row);
                                        (await cell).gender = null;
                                        return cell;
                                    })());
                                })();
                            }
                            break;
                    }
                }).then(console.log(`${sheet.title} indexed`));
                stopTime = new Date();
            });
            console.log(`${this.doc.title} indexed in ${stopTime - startTime}ms`);
            // probably needs to be async
            setTimeout(() => {
                console.log("Ready\n");
                this.ready = true;
                callback();
            }, 5 * 1000);
        });
    }

    // SEARCHING
    itemFilter(cell) {
        return super.itemFilter(cell) || cell.aliases.includes(this.toLowerCase()); // or if the query matches an alias
    }

    static tagClass(filterResults, tag) {
        filterResults.forEach((item) => { item.armorClass = tag; });
        return filterResults;
    }

    search(_msg, query) {
        /* 
        message: Message object as described by the discord.js library.
        query: The query the user searched.
        */
        let armorClass = undefined;
        let gender = undefined;

        query = query.replace(/\barmor(\s)?(for\s((titans?)?(hunters?)?(warlocks?)?))?/gi, "set").trim();

        if (query.toLowerCase().includes("hunter")) {
            armorClass = "hunter";
        } else if (query.toLowerCase().includes("warlock")) {
            armorClass = "warlock";
        } else if (query.toLowerCase().includes("titan")) {
            armorClass = "titan";
        }
        query = query.replace(/((titans?)?(hunters?)?(warlocks?)?)/gmi, '').trim();

        if (query.toLowerCase().includes("female")) {
            gender = "female";
        } else if (query.toLowerCase().includes("male") && !query.toLowerCase().includes("fe")) {
            gender = "male";
        }
        query = query.replace(/(fe)?male\s/gi, '').trim();

        // check if the query should be overridden
        queryOverrides.forEach((overridePair) => {
            if (overridePair.replaces.includes(query.toLowerCase())) {
                query = overridePair.replacement;
            }
        });

        let results = [];
        if (!!armorClass || !!gender) { // if a class or gender is specified
            if (armorClass) { // If a class is specified, (Warlock, Titan, Hunter) only look at that classes armor
                results = this.tagClass(this.items[`${armorClass}Armor`].filter(itemFilter, query), armorClass);
            } else { // Otherwise look at all items
                for (let key in this.items) {
                    results = results.concat(DestinyResponder.tagClass(this.items[key].filter(this.itemFilter, query), (key.toLowerCase().includes('armor') ? key.split("Armor").shift() : undefined)));
                }
            }

            if (gender) { // If a gender is specified, search the armors
                results = results.filter((item) => {
                    if (!item.gender) { return true }
                    return item.gender.toLowerCase() === gender.toLowerCase()
                });
            }

        } else { // otherwise...
            for (let key in this.items) {
                if (key === "elseItems") {
                    results = results.concat(this.items.elseItems.filter(this.itemFilter, query));
                } else {
                    results = results.concat(DestinyResponder.tagClass(this.items[key].filter(this.itemFilter, query), key.split("Armor").shift()));
                }
            }
        }

        return results;
    }

    // RESPONDING
    static generateQualifierString(gender, armorClass) {
        return `${(!!gender ? gender + " " : "")}${(!!armorClass ? this.capitalizeWord(armorClass) + " " : "")}`;
    }

    static generateFullyQualifiedName(responseItem) {
        return `${DestinyResponder.generateQualifierString(responseItem.gender, responseItem.armorClass)}${String(responseItem.entry.formattedValue).trim()}`;
    }

    // function fallbackResponse(query) {
    //     return (!!query ? `The ${query} model was not found.` : "Your query did not return a valid result.") +
    //         "\n#frequently-asked-questions #2 \nYou can check the Google Drive first, but if it isn't there you can learn to rip yourself! Learn more here: <https://discordapp.com/channels/514059860489404417/592620141909377026/684604120820482087> \nThere's a guide on how to rip from the game too if it's a boss or environment asset you need: <http://bit.ly/36CI6d8>";
    // }

    static fallbackResponse(query = "") {
        return;
    }

    static respond(results) {
        let response = "";
        // generate response text
        if (results.length === 1) {
            response = (!!results[0] ?
                `The ${DestinyResponder.generateFullyQualifiedName(results[0])} model is ${(results[0].entry.hyperlink ?
                    `available at <${results[0].entry.hyperlink}>.` :
                    "not available yet.")}` :
                DestinyResponder.fallbackResponse(`${DestinyResponder.generateQualifierString(results[0].gender, results[0].armorClass)}${args}`));
        } else if (results.length === 0) {
            response = DestinyResponder.fallbackResponse();
        } else { // TODO: If an entry matches the query with 100% similarity, respond with only that entry
            response = "Your query returned multiple results.\n"
            results.forEach((i) => {
                response += `The ${DestinyResponder.generateFullyQualifiedName(i)} model is ${(i.entry.hyperlink ?
                    `available at <${i.entry.hyperlink}>.` :
                    "not available yet.")}\n`;
            }
            );
        }

        return response;
    }
}

module.exports = DestinyResponder;