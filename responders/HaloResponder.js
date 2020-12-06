const BaseResponder = require('./BaseResponder.js');
const evaluateReplace = require('../evaluateReplace.js');

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

        // start timer
        let startTime = new Date();
        let stopTime = undefined;

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
                stopTime = new Date();
            });
            console.log(`${this.doc.title} indexed in ${stopTime - startTime}ms`);
            setTimeout(() => {
                console.log("Ready\n");
                this.ready = true;
                callback();
            }, 5 * 1000);
        });
    }

    // SEARCHING
    search(_msg, query) {
        let installment = undefined;

        // Detect what game the user wants (CE, 2A, Reach, etc)
        installment = (() => {
            if (query.split("halo ").length > 1) {

            } else {
                return;
            }
        })();

        let results = [];
        if (gameToQuery) {
            results = results.concat(BaseResponder.addParam(this.items[gameToQuery].filter(this.itemFilter, query), 'game', gameToQuery));
        } else {
            for (let key in this.items) {
                results = results.concat(BaseResponder.addParam(this.items[key].filter(this.itemFilter, query), 'game', key));
            }
        }
    }

    static generateQualifierString(installment){ // only here for compatibility
        return evaluateReplace(installment, {replacement: '', callback: (res) => {return `${res} `}});
    }

    static generateFullyQualifiedName(responseItem) {
        return `${HaloResponder.generateQualifierString(responseItem.installment)}${String(responseItem.entry.formattedValue).trim()}`;
    } 


}

module.exports = HaloResponder;