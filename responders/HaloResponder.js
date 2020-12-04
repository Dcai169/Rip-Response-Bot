const BaseResponder = require('./BaseResponder.js');

class HaloResponder extends BaseResponder {
    constructor(doc) {
        super(doc);
    }

    // INDEXING
    resetIndexes() {
        this.ready = false;
        this.items = {
            "Halo CE": [],
            "Halo CEA": [],
            "Halo 2 Classic": [],
            "Halo 2 Anniversary": [],
            "Halo 3": [],
            "Halo 3: ODST": [],
            "Halo Reach": [],
            "Halo 4": [],
            "Halo 5": [],
            "Halo Wars": [],
            "Halo Wars 2": []
        };
    }

    async createItemObj(sheet, row) {
        return {
            entry: sheet.getCell(row, 0)
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
                            this.items[sheet.title].push(await this.createItemObj(sheet, row));
                        })();
                    }
                }).then(console.log(`${sheet.title} indexed`));
            });
            setTimeout(() => {
                console.log("Ready\n");
                this.ready = true;
                callback();
            }, 5 * 1000);
        });
    }

    // SEARCHING
    search(_msg, query) {
        let game = undefined;

        // Detect what game the user wants (CE, 2A, Reach, etc)
        let installment = (() => {
            if (query.split("halo ").length > 1) {

            } else {
                return;
            }
        })();

        let results = [];
        if (game) {
            // code
        } else {
            for (let key in this.items) {
                results = results.concat(this.items[key].filter(itemFilter, query));
            }
        }
    }
}