import { SheetBaseResponder } from './SheetBaseResponder';
import { evaluateReplace } from '../evaluateReplace';
import { warframeEntry } from './../types'
import levenshtien = require('damerau-levenshtein');
import { GoogleSpreadsheet, GoogleSpreadsheetWorksheet } from 'google-spreadsheet';

export class WarframeResponder extends SheetBaseResponder {
    ready: boolean;
    items: any[];

    constructor(doc: GoogleSpreadsheet) {
        super(doc, 'warframe', '190672762270908416');
    }

    // INDEXING
    resetIndexes() {
        this.ready = false;
        this.items = [];
    }

    async createItemObj(sheet: GoogleSpreadsheetWorksheet, row: number) {
        return {
            name: sheet.getCell(row, 0).formattedValue,
            baseRip: evaluateReplace(sheet.getCell(row, 3).hyperlink),
            skins: evaluateReplace(sheet.getCell(row, 4).hyperlink),
            sfm1: evaluateReplace(sheet.getCell(row, 5).hyperlink),
            sfm2: evaluateReplace(sheet.getCell(row, 6).hyperlink),
            sfm3: evaluateReplace(sheet.getCell(row, 7).hyperlink),
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
                                this.items.push(item);
                            }
                        })();
                    }
                }).then(() => {console.log(`${sheet.title} indexed`)});
            });
        }).then(() => {
            console.log('Warframe Ready');
            this.ready = true;
            callback();
        });
    }

    // SEARCHING
    itemFilter(cell) { // return true or false based on if the item should be included or not
        return levenshtien((!!cell.name ? // if the cell's formattedValue exists i.e. is not empty
            cell.name.toLowerCase().replace(/(\W)?$/gmi, '').replace(/\b((the\s)?((an?)\s)?(is)?){1}\b/gi, '') : // if it does exist, do more filtering
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

    generateFullyQualifiedName(item) {
        return `${String(item.name).trim()}`;
    }
}
