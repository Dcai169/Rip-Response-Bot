import { SheetBaseResponder } from './SheetBaseResponder';
import { evaluateReplace } from '../evaluateReplace';
import { warframeEntry } from './../types'
import levenshtien = require('damerau-levenshtein');
import { GoogleSpreadsheet, GoogleSpreadsheetWorksheet } from 'google-spreadsheet';

export class WarframeResponder extends SheetBaseResponder {
    ready: boolean;
    items: warframeEntry[];

    constructor(doc: GoogleSpreadsheet) {
        super(doc, 'warframe', '190672762270908416');
    }

    // INDEXING
    resetIndexes() {
        this.ready = false;
        this.items = [];
    }

    async createItemObj(sheet: GoogleSpreadsheetWorksheet, row: number): Promise<warframeEntry> {
        return {
            name: sheet.getCell(row, 0).formattedValue,
            baseRip: evaluateReplace(sheet.getCell(row, 3).hyperlink),
            skins: evaluateReplace(sheet.getCell(row, 4).hyperlink),
            sfm1: evaluateReplace(sheet.getCell(row, 5).hyperlink),
            sfm2: evaluateReplace(sheet.getCell(row, 6).hyperlink),
            sfm3: evaluateReplace(sheet.getCell(row, 7).hyperlink),
        };
    }

    async loadIndexes() {
        // clear arrays
        this.resetIndexes();

        // get new data
        await this.doc.loadInfo();
        this.doc.sheetsByIndex.forEach(async sheet => {
            await sheet.loadCells();
            for (let row = 0; row < sheet.rowCount; row++) { // then add the data to the array
                (async () => {
                    let item = await this.getItem(sheet, row, this.headerSize);
                    if (item) {
                        this.items.push(item);
                    }
                })();
            }
            console.log(`${sheet.title} indexed`);
        });
        console.log('Halo Indexed');
        this.ready = true;
    }

    // SEARCHING
    itemFilter(this: string, entry: warframeEntry) { // return true or false based on if the item should be included or not
        return levenshtien((!!entry.name ? // if the cell's formattedValue exists i.e. is not empty
            entry.name.toLowerCase().replace(/(\W)?$/gmi, '').replace(/\b((the\s)?((an?)\s)?(is)?){1}\b/gi, '') : // if it does exist, do more filtering
            ''), this).similarity > parseInt(process.env.SIMILARITY_THRESHOLD) // the Damerau-Levenshtien distance must greater than the specified number
    }

    search(query: string) {
        let results: warframeEntry[] = [];
        results = results.concat(this.items.filter(this.itemFilter, query.toLowerCase()));
        return results
    }

    // RESPONDING
    generateQualifierString() {
        return '';
    }

    generateFullyQualifiedName(entry: warframeEntry) {
        return `${String(entry.name).trim()}`;
    }
}
