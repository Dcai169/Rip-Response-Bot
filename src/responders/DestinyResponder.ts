import { SheetBaseResponder } from './SheetBaseResponder';
import { GoogleSpreadsheet, GoogleSpreadsheetWorksheet } from 'google-spreadsheet';
import Discord = require('discord.js');
const removeArticles = require('../redrix.js').removeArticles;
const queryOverrides = JSON.parse(require('fs').readFileSync('./config/query_overrides.json', 'utf8')).destiny;

export class DestinyResponder extends SheetBaseResponder {
    items: { hunterArmor: any[]; titanArmor: any[]; warlockArmor: any[]; elseItems: any[]; };

    constructor(doc: GoogleSpreadsheet) {
        super(doc, 'destiny', '461093992499773440', 12);
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

    static async createItemObj(sheet: GoogleSpreadsheetWorksheet, row: number) {
        return {
            entry: sheet.getCell(row, 0),
            gender: (sheet.title.toLowerCase().includes('armor') ? sheet.getCell(row, 2).formattedValue : null),
            aliases: evaluateReplace(sheet.getCell(row, 3).formattedValue, { replacement: [], callback: (res) => { return res.split(', ').map(removeArticles) } })
        };
    }

    loadIndexes(callback = () => { }) {
        // clear arrays
        this.resetIndexes();

        // get new data
        this.doc.loadInfo().then(() => {
            this.doc.sheetsByIndex.forEach(sheet => { // for each sheet
                sheet.loadCells().then(() => { // load the sheet
                    switch (sheet.title.toLowerCase().split(' ').shift()) {
                        case 'hunter':
                            for (let row = 0; row < sheet.rowCount; row++) { // then add the data to the array
                                (async () => {
                                    let item = await BaseResponder.getItem(sheet, row, DestinyResponder, this.headerSize);
                                    if (item) {
                                        this.items.hunterArmor.push(item);
                                    }
                                })();
                            }
                            break;

                        case 'warlock':
                            for (let row = 0; row < sheet.rowCount; row++) { // then add the data to the array
                                (async () => {
                                    let item = await BaseResponder.getItem(sheet, row, DestinyResponder, this.headerSize);
                                    if (item) {
                                        this.items.warlockArmor.push(item);
                                    }
                                })();
                            }
                            break;

                        case 'titan':
                            for (let row = 0; row < sheet.rowCount; row++) { // then add the data to the array
                                (async () => {
                                    let item = await BaseResponder.getItem(sheet, row, DestinyResponder, this.headerSize);
                                    if (item) {
                                        this.items.titanArmor.push(item);
                                    }
                                })();
                            }
                            break;

                        default:
                            for (let row = 0; row < sheet.rowCount; row++) {
                                (async () => {
                                    let item = await BaseResponder.getItem(sheet, row, DestinyResponder, this.headerSize);
                                    if (item) {
                                        this.items.elseItems.push(item);
                                    }
                                })();
                            }
                            break;
                    }
                }).then(console.log(`${sheet.title} indexed`));
            });
        }).then(() => {
            // probably needs to be async
            console.log('Destiny Ready');
            this.ready = true;
            callback();
        });
    }

    // SEARCHING
    itemFilter(cell) {
        return super.itemFilter(cell) || cell.aliases.includes(this.toLowerCase()); // or if the query matches an alias
    }

    search(interaction: Discord.Interaction) {
        /* 
        message: Message object as described by the discord.js library.
        query: The query the user searched.
        */
        let armorClass = undefined;
        let gender = undefined;

        query = query.toLowerCase();
        query = query.replace(/\barmor(\s)?(for\s((titans?)?(hunters?)?(warlocks?)?))?/gi, 'set').trim();

        if (query.includes('hunter')) {
            armorClass = 'hunter';
        } else if (query.includes('warlock')) {
            armorClass = 'warlock';
        } else if (query.includes('titan')) {
            armorClass = 'titan';
        }
        query = query.replace(/((titans?)?(hunters?)?(warlocks?)?)/gmi, '').trim();

        if (query.includes('female')) {
            gender = 'female';
        } else if (query.includes('male') && !query.includes('fe')) {
            gender = 'male';
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
                results = BaseResponder.addParam(this.items[`${armorClass}Armor`].filter(this.itemFilter, query), 'armorClass', armorClass);
            } else { // Otherwise look at all items
                for (let key in this.items) {
                    results = results.concat(BaseResponder.addParam(this.items[key].filter(this.itemFilter, query), 'armorClass', (key.toLowerCase().includes('armor') ? key.split('Armor').shift() : undefined)));
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
                if (key === 'elseItems') {
                    results = results.concat(this.items.elseItems.filter(this.itemFilter, query));
                } else {
                    results = results.concat(BaseResponder.addParam(this.items[key].filter(this.itemFilter, query), 'armorClass', key.split('Armor').shift()));
                }
            }
        }

        return results;
    }

    // RESPONDING
    static generateQualifierString(gender, armorClass) {
        return `${evaluateReplace(gender, { replacement: '', callback: (res) => { return `${res} ` } })}${evaluateReplace(armorClass, { replacement: '', callback: (res) => { return `${this.capitalizeWord(res)} ` } })}`;
    }

    static generateFullyQualifiedName(responseItem) {
        return `${DestinyResponder.generateQualifierString(responseItem.gender, responseItem.armorClass)}${String(responseItem.entry.formattedValue).trim()}`;
    }

    // static fallbackResponse(query = '') { (!!query ? `The ${query} model was not found.` : 'Your query did not return a valid result.') + '\n#frequently-asked-questions #2 \nYou can check the Google Drive first, but if it isn't there you can learn to rip yourself! Learn more here: <https://discordapp.com/channels/514059860489404417/592620141909377026/684604120820482087> \nThere's a guide on how to rip from the game too if it's a boss or environment asset you need: <http://bit.ly/36CI6d8>'; }
}

module.exports = DestinyResponder;