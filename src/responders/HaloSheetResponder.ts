import { SheetBaseResponder } from './SheetBaseResponder';
import { GoogleSpreadsheet, GoogleSpreadsheetWorksheet } from 'google-spreadsheet';
import { overridePair, haloEntry } from '../types';
const queryOverrides: overridePair[] = JSON.parse(require('fs').readFileSync(`${__dirname}/../config/query_overrides.json`, 'utf8')).halo;

export class HaloSheetResponder extends SheetBaseResponder {
    items: Map<string, haloEntry[]>;

    constructor() {
        super(new GoogleSpreadsheet('11FSNqnAicEaHAXNmzJE7iA9zPPZILwOvK9iBDGuCNHo'), 'halo', '341213672947056651', 18);
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

    async createItemObj(sheet: GoogleSpreadsheetWorksheet, row: number): Promise<haloEntry> {
        let cell = sheet.getCell(row, 0);
        if (!!cell.formattedValue && cell.effectiveFormat.textFormat.fontSize < this.headerSize) { // Header and empty row detection
            return {
                name: (cell.formattedValue as string).trim(),
                link: cell.hyperlink,
                game: sheet.title
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
            for (let row = 0; row < sheet.rowCount; row++) { // then add the data to the array
                (async () => {
                    let item = await this.createItemObj(sheet, row);
                    if (item) {
                        this.items.get(sheet.title).push(item);
                    }
                })();
            }
            // console.log(`${sheet.title} indexed`);
        });
        console.log('Halo Ready');
        this.ready = true;
    }

    // SEARCHING
    search(query: string, options: { game: string }) {
        let gameToQuery = options.game;

        if (query === 'chief') { query = 'master chief'; }
        // check if the query should be overridden
        queryOverrides.forEach((overridePair) => {
            if (overridePair.replaces.includes(query.toLowerCase())) {
                query = overridePair.replacement;
            }
        });

        let results: haloEntry[] = [];
        if (gameToQuery) {
            results = this.items.get(gameToQuery).filter(this.itemFilter, query.toLowerCase());
        } else {
            this.items.forEach((items) => {
                results = results.concat(items.filter(this.itemFilter, query.toLowerCase()));
            });
        }

        return results;
    }

    generateQualifierString(game: string) {
        return (game ? `${game} ` : '');
    }

    generateFullyQualifiedName(responseItem: haloEntry) {
        return `${this.generateQualifierString(responseItem.game)}${responseItem.name}`;
    }
}
