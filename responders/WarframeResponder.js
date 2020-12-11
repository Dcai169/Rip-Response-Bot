const BaseResponder = require('./BaseResponder.js');
const evaluateReplace = require('../evaluateReplace.js');
const fs = require('fs');

class WarframeResponder extends BaseResponder {
    constructor(doc) {
        super(doc, 'warframe', '190672762270908416');
    }

    // INDEXING
    resetIndexes() {
        this.ready = false;
        this.items = [];
    }

    static async createItemObj(sheet, row) {
        return {
            name: sheet.getCell(row, 0).formattedValue,
            baseRip: evaluateReplace(sheet.getCell(row, 4).hyperlink),
            skins: evaluateReplace(sheet.getCell(row, 5).hyperlink),
            sfm1: evaluateReplace(sheet.getCell(row, 6).hyperlink),
            sfm2: evaluateReplace(sheet.getCell(row, 7).hyperlink),
            sfm3: evaluateReplace(sheet.getCell(row, 8).hyperlink),
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
                            let item = await BaseResponder.getItem(sheet, row, WarframeResponder, this.headerSize);
                            if (item) {
                                this.items.push(item);
                            }
                        })();
                    }
                }).then(console.log(`${sheet.title} indexed`));
            });
        }).then(() => {
            stopTime = new Date();
            console.log(`${this.doc.title} indexed in ${stopTime - startTime}ms`);
            console.log("Warframe Ready");
            this.ready = true;
            callback();
        });
    }

    // SEARCHING
    search(_msg, query) {
        let results = [];
        results = results.concat(this.items.filter(this.itemFilter, query));
    }

    static generateFullyQualifiedName(responseItem) {
        return `${String(responseItem.name).trim()}`;
    }

    static resultResponse(result) {
        return `The ${this.generateFullyQualifiedName(result)} model is ${evaluateReplace(result.baseRip, { replacement: 'not available yet.', callback: (res) => { return `available at <${res}>.` } })}\n\
        SFM ports may be available. See the spreadsheet for further information.`;
    }
}

module.exports = WarframeResponder;