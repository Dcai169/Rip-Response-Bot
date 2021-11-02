require('dotenv').config({ path: './config.env' });
import { GoogleSpreadsheet, GoogleSpreadsheetWorksheet } from 'google-spreadsheet';
import { BaseResponder } from './BaseResponder';

export abstract class SheetBaseResponder extends BaseResponder {
    doc: GoogleSpreadsheet;
    headerSize: number;

    constructor(doc: GoogleSpreadsheet, game: string, ownerId: string | string[], headerSize = 12) {
        super(game, ownerId);
        this.doc = doc;
        this.headerSize = headerSize;
        this.ready = false;

        console.time(`${this.game}Sheet`);
        this.doc.useApiKey(process.env.GSHEETAPI);
        this.loadItems().then(() => {
            console.timeEnd(`${this.game}Sheet`);
            // console.log(`${this.game} Ready`);
            this.ready = true;
        });
    }

    abstract resetIndexes(): void

    abstract createItemObj(sheet: GoogleSpreadsheetWorksheet, row: number): Promise<{[key: string]: any}>;

    async getItem(this: SheetBaseResponder, sheet: GoogleSpreadsheetWorksheet, row: number) {
        if (!!sheet.getCell(row, 0).formattedValue && sheet.getCell(row, 0).effectiveFormat.textFormat.fontSize < this.headerSize) { // Header and empty row detection
            return await this.createItemObj(sheet, row);
        } else {
            return null;
        }
    }

    abstract loadItems(): Promise<void>
}