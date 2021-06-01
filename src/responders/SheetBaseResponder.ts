require('dotenv').config({ path: './config.env' });
import levenshtein = require('damerau-levenshtein');
import { GoogleSpreadsheet, GoogleSpreadsheetWorksheet } from 'google-spreadsheet';
import { Entry } from 'src/types';
import { BaseResponder } from './BaseResponder';

export abstract class SheetBaseResponder extends BaseResponder {
    doc: GoogleSpreadsheet;
    headerSize: number;
    ready: boolean;

    constructor(doc: GoogleSpreadsheet, game: string, ownerId: string | string[], headerSize = 12) {
        super(game, ownerId);
        this.doc = doc;
        this.headerSize = headerSize;
        this.ready = false;

        this.doc.useApiKey(process.env.GSHEETAPI);
        this.loadIndexes();
    }

    resetIndexes(): void {
        this.ready = false;
    }

    itemFilter(this: string, entry: Entry) {
        return levenshtein(entry.cell.formattedValue.toLowerCase().replace(/(\W)?$/gmi, '').replace(/\b((the\s)?((an?)\s)?(is)?){1}\b/gi, ''), this).similarity > parseFloat(process.env.SIMILARITY_THRESHOLD) // the Damerau-Levenshtien distance must greater than the specified number || entry.aliases.includes(this.toLowerCase()); // or if the query matches an alias
    }

    abstract createItemObj(sheet: GoogleSpreadsheetWorksheet, row: number): Promise<{[key: string]: any}>;

    async getItem(this: SheetBaseResponder, sheet: GoogleSpreadsheetWorksheet, row: number) {
        if (!!sheet.getCell(row, 0).formattedValue && sheet.getCell(row, 0).effectiveFormat.textFormat.fontSize < this.headerSize) { // Header and empty row detection
            return await this.createItemObj(sheet, row);
        } else {
            return null;
        }
    }

    abstract loadIndexes(callback?: Function): void
}