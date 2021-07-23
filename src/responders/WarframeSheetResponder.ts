import { SheetBaseResponder } from './SheetBaseResponder';
import { warframeEntry } from '../types'
import { GoogleSpreadsheet, GoogleSpreadsheetWorksheet } from 'google-spreadsheet';
import * as levenshtein from 'damerau-levenshtein';

export class WarframeSheetResponder extends SheetBaseResponder {
    items: warframeEntry[];

    constructor() {
        super(new GoogleSpreadsheet('12GEPZuEBhQozCZjTTYMAQzK9iqAHuOC6zzr_cn5mi8o'), 'Warframe', '190672762270908416');

        this.items = [];
    }

    // INDEXING
    resetIndexes() {
        this.ready = false;
        this.items = [];
    }

    async createItemObj(sheet: GoogleSpreadsheetWorksheet, row: number): Promise<warframeEntry> {
        return new Promise((resolve) => {
            let cell = sheet.getCell(row, 0);
            if (!!cell.formattedValue && cell.effectiveFormat.textFormat.fontSize < this.headerSize) { // Header and empty row detection
                resolve({
                    name: (cell.formattedValue as string).trim(),
                    link: sheet.getCell(row, 3).hyperlink,
                    sfm1: sheet.getCell(row, 4).hyperlink,
                    sfm2: sheet.getCell(row, 5).hyperlink,
                    sfm3: sheet.getCell(row, 6).hyperlink
                });
            }
        });   
    }

    itemFilter(this: string, entry: warframeEntry): boolean {
        return levenshtein(entry.name.toLowerCase().replace(/(\W)?$/gmi, '').replace(/\b((the\s)?((an?)\s)?(is)?){1}\b/gi, ''), this).similarity > parseFloat(process.env.SIMILARITY_THRESHOLD);
    }

    async loadIndexes() {
        // clear arrays
        this.resetIndexes();

        // get new data
        await this.doc.loadInfo();
        this.doc.sheetsByIndex.forEach(async sheet => {
            await sheet.loadCells();
            for (let row = 1; row < sheet.rowCount; row++) { // then add the data to the array
                (async () => {
                    let item = await this.createItemObj(sheet, row);
                    if (item) {
                        this.items.push(item);
                    }
                })();
            }
            // console.log(`${sheet.title} indexed`);
        });
        // console.log('Warframe Indexed');
        this.ready = true;
    }

    search(query: string): warframeEntry[] {
        return [].concat(this.items.filter(this.itemFilter, query.toLowerCase()));
    }

    // RESPONDING
    generateQualifierString() {
        return '';
    }

    generateFullyQualifiedName(entry: warframeEntry) {
        return `${String(entry.name).trim()}`;
    }
}
