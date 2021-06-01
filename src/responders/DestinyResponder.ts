import { SheetBaseResponder } from './SheetBaseResponder';
import { GoogleSpreadsheet, GoogleSpreadsheetWorksheet } from 'google-spreadsheet';
import { evaluateReplace } from './../evaluateReplace';
import { destinyEntry, overridePair } from 'src/types';
import { BaseResponder } from './BaseResponder';
import levenshtein = require('damerau-levenshtein');
const queryOverrides = JSON.parse(require('fs').readFileSync(`${__dirname}/../config/query_overrides.json`, 'utf8')).destiny;

export class DestinyResponder extends SheetBaseResponder {
    items: Map<string, destinyEntry[]>;
    ready: boolean;

    constructor() {
        super(new GoogleSpreadsheet('18-pxaUaUvYxACE5uMveCE9_bewwhfbd93ZaLIyP_rxQ'), 'destiny', '461093992499773440', 12);
    }

    // INDEXING
    resetIndexes() {
        this.ready = false;
        this.items = new Map([
            ['hunterArmor', []],
            ['titanArmor', []],
            ['warlockArmor', []],
            ['elseItems', []]
        ]);
    }

    async createItemObj(sheet: GoogleSpreadsheetWorksheet, row: number): Promise<destinyEntry> {
        if (!!sheet.getCell(row, 0).formattedValue && sheet.getCell(row, 0).effectiveFormat.textFormat.fontSize < this.headerSize) { // Header and empty row detection
            return {
                cell: sheet.getCell(row, 0),
                gender: (sheet.title.toLowerCase().includes('armor') ? sheet.getCell(row, 2).formattedValue : undefined),
                aliases: evaluateReplace(sheet.getCell(row, 3).formattedValue, { replacement: [], callback: (res) => { return res.split(', ').map((alias: string) => { return alias.replace(/(\W)?$/gmi, '').replace(/\b((the\s)?((an?)\s)?(is)?){1}\b/gi, '')}) } })
            };
        } else {
            return null;
        }
    }

    itemFilter(this: string, entry: destinyEntry) {
        return levenshtein(entry.cell.formattedValue.toLowerCase().replace(/(\W)?$/gmi, '').replace(/\b((the\s)?((an?)\s)?(is)?){1}\b/gi, '').replace(/ (suit|set)/gi, ''), this).similarity > parseFloat(process.env.SIMILARITY_THRESHOLD) || entry.aliases.includes(this.toLowerCase()); 
    }

    async loadIndexes() {
        // clear arrays
        this.resetIndexes();

        // get new data
        await this.doc.loadInfo();
        this.doc.sheetsByIndex.forEach(async sheet => { // for each sheet
            await sheet.loadCells(); // load the sheet
            switch (sheet.title.toLowerCase().split(' ').shift()) {
                case 'hunter':
                    for (let row = 0; row < sheet.rowCount; row++) { // then add the data to the array
                        (async () => {
                            let item = await this.createItemObj(sheet, row);
                            if (item) {
                                item.armorClass = 'hunter';
                                this.items.get('hunterArmor').push(item);
                            }
                        })();
                    }
                    break;

                case 'warlock':
                    for (let row = 0; row < sheet.rowCount; row++) { // then add the data to the array
                        (async () => {
                            let item = await this.createItemObj(sheet, row);
                            if (item) {
                                item.armorClass = 'warlock';
                                this.items.get('warlockArmor').push(item);
                            }
                        })();
                    }
                    break;

                case 'titan':
                    for (let row = 0; row < sheet.rowCount; row++) { // then add the data to the array
                        (async () => {
                            let item = await this.createItemObj(sheet, row);
                            if (item) {
                                item.armorClass = 'titan';
                                this.items.get('titanArmor').push(item);
                            }
                        })();
                    }
                    break;

                default:
                    for (let row = 0; row < sheet.rowCount; row++) {
                        (async () => {
                            let item = await this.createItemObj(sheet, row);
                            if (item) {
                                this.items.get('elseItems').push(item);
                            }
                        })();
                    }
                    break;
            }
            console.log(`${sheet.title} indexed`);
        });
        console.log('Destiny Ready');
        this.ready = true;
    }

    // SEARCHING
    search(query: string, options: { armorClass: string, gender: string }) {
        /* 
        message: Message object as described by the discord.js library.
        query: The query the user searched.
        */
        let armorClass = options.armorClass;
        let gender = options.gender;
        query = query.toLowerCase();

        // check if the query should be overridden
        queryOverrides.forEach((overridePair: overridePair) => {
            if (overridePair.replaces.includes(query.toLowerCase())) {
                query = overridePair.replacement;
            }
        });

        let results: destinyEntry[] = [];
        if (armorClass || gender) { // if a class or gender is specified
            console.log(armorClass, gender);
            if (armorClass) { // If a class is specified, (Warlock, Titan, Hunter) only look at that classes armor
                results = this.items.get(`${armorClass}Armor`).filter(this.itemFilter, query);
            } else { // Otherwise look at all items
                for (let key in this.items) {
                    results = results.concat(this.items.get(key).filter(this.itemFilter, query));
                }
            }

            if (gender) { // If a gender is specified, search the armors
                results = results.filter((item) => {
                    if (!item.gender) { return true }
                    return item.gender.toLowerCase() === gender.toLowerCase()
                });
            }
        } else { // otherwise...
            this.items.forEach((items) => {
                results = results.concat(items.filter(this.itemFilter, query));
            });
        }

        return results;
    }

    // RESPONDING
    generateQualifierString(gender: string, options: { armorClass: string }) {
        return `${evaluateReplace(gender, { replacement: '', callback: (res) => { return `${res} ` } })}${evaluateReplace(options.armorClass, { replacement: '', callback: (res) => { return `${BaseResponder.capitalizeWord(res)} ` } })}`;
    }

    generateFullyQualifiedName(responseItem: destinyEntry) {
        return `${this.generateQualifierString(responseItem.gender, {armorClass: responseItem.armorClass})}${String(responseItem.cell.formattedValue).trim()}`;
    }

    // static fallbackResponse(query = '') { (!!query ? `The ${query} model was not found.` : 'Your query did not return a valid result.') + '\n#frequently-asked-questions #2 \nYou can check the Google Drive first, but if it isn't there you can learn to rip yourself! Learn more here: <https://discordapp.com/channels/514059860489404417/592620141909377026/684604120820482087> \nThere's a guide on how to rip from the game too if it's a boss or environment asset you need: <http://bit.ly/36CI6d8>'; }
}
