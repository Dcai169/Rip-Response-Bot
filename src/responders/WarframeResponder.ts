import { SheetBaseResponder } from './SheetBaseResponder';
import { warframeEntry } from './../types'
import { GoogleSpreadsheet, GoogleSpreadsheetWorksheet } from 'google-spreadsheet';

export class WarframeResponder extends SheetBaseResponder {
    ready: boolean;
    items: warframeEntry[];

    constructor() {
        super(new GoogleSpreadsheet('12GEPZuEBhQozCZjTTYMAQzK9iqAHuOC6zzr_cn5mi8o'), 'warframe', '190672762270908416');
    }

    // INDEXING
    resetIndexes() {
        this.ready = false;
        this.items = [];
    }

    async createItemObj(sheet: GoogleSpreadsheetWorksheet, row: number): Promise<warframeEntry> {
        if (!!sheet.getCell(row, 0).formattedValue && sheet.getCell(row, 0).effectiveFormat.textFormat.fontSize < this.headerSize) { // Header and empty row detection
            return {
                name: sheet.getCell(row, 0).formattedValue,
                cell: sheet.getCell(row, 3),
                skins: sheet.getCell(row, 4),
                sfm1: sheet.getCell(row, 5),
                sfm2: sheet.getCell(row, 6),
                sfm3: sheet.getCell(row, 7),
            };
        } else {
            return null;
        }
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
            console.log(`${sheet.title} indexed`);
        });
        console.log('Warframe Indexed');
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
