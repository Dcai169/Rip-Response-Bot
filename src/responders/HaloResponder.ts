import { SheetBaseResponder } from './SheetBaseResponder';
import { GoogleSpreadsheet, GoogleSpreadsheetWorksheet } from 'google-spreadsheet';
import levenshtien = require('damerau-levenshtein');
import { overridePair, haloEntry } from './../types';
const queryOverrides = JSON.parse(require('fs').readFileSync('./config/query_overrides.json', 'utf8')).halo;

export class HaloResponder extends SheetBaseResponder {
    items: Map<string, haloEntry[]>;
    constructor(doc: GoogleSpreadsheet) {
        super(doc, 'halo', '341213672947056651', 18);
    }

    // INDEXING
    resetIndexes(): void {
        this.ready = false;
        this.items = new Map([
            ['Halo CE', []],
            ['Halo CEA', []],
            ['Halo 2 Classic', []],
            ['Halo 2 Anniversary', []],
            ['Halo 2 A Multiplayer', []],
            ['Halo 3', []],
            ['Halo 3: ODST', []],
            ['Halo Reach', []],
            ['Halo 4', []],
            ['Halo 5', []],
            ['Halo Wars', []],
            ['Halo Wars 2', []],
            ['Halo: Spartan Strike', []]
        ]);
    }

    async createItemObj(sheet: GoogleSpreadsheetWorksheet, row: number) {
        return {
            entry: sheet.getCell(row, 0),
            game: sheet.title
        };
    }

    loadIndexes(callback = () => { }) {
        // clear arrays
        this.resetIndexes();

        // get new data
        this.doc.loadInfo().then(() => {
            this.doc.sheetsByIndex.forEach(sheet => {
                sheet.loadCells().then(() => {
                    for (let row = 0; row < sheet.rowCount; row++) { // then add the data to the array
                        (async () => {
                            let item = await this.getItem(sheet, row, this.headerSize);
                            if (item) {
                                try {
                                    this.items.get(sheet.title).push(item.entry);
                                } catch (error) {
                                    // This gives an a TypeError for some reason even though the program works properly.
                                    // Just ignore the error.
                                }
                            }
                        })();
                    }
                }).then(() => { console.log(`${sheet.title} indexed`) });
            });
        }).then(() => {
            console.log('Halo Ready');
            this.ready = true;
            callback();
        });
    }

    // SEARCHING
    search(query: string, options: { game: string }) {
        let gameToQuery = options.game;

        if (query === 'chief') { query = 'master chief'; }
        // check if the query should be overridden
        queryOverrides.forEach((overridePair: overridePair) => {
            if (overridePair.replaces.includes(query.toLowerCase())) {
                query = overridePair.replacement;
            }
        });

        let results: haloEntry[] = [];
        if (gameToQuery) {
            results = this.items.get(gameToQuery).filter(this.itemFilter, query.toLowerCase());
        } else {
            for (let key in this.items.keys()) {
                results = results.concat(this.items.get(key).filter(this.itemFilter, query.toLowerCase()));
            }
        }

        return results;
    }

    itemFilter(this: string, item: haloEntry) {
        return levenshtien((!!item.entry.formattedValue ? // if the cell's formattedValue exists i.e. is not empty
        item.entry.formattedValue.toLowerCase().replace(/(\W)?$/gmi, '').replace(/\b((the\s)?((an?)\s)?(is)?){1}\b/gi, '') : // if it does exist, do more filtering
            ''), this).similarity > parseInt(process.env.SIMILARITY_THRESHOLD) // the Damerau-Levenshtien distance must greater than the specified number
    }

    generateQualifierString(game: string) {
        return (game ? game : '');
    }

    generateFullyQualifiedName(responseItem: haloEntry) {
        return `${this.generateQualifierString(responseItem.game)}${String(responseItem.entry.formattedValue).trim()}`;
    }


}
