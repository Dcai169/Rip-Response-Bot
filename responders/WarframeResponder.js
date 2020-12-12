const BaseResponder = require('./BaseResponder.js');
const evaluateReplace = require('../evaluateReplace.js');
const levenshtien = require('damerau-levenshtein');
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
            console.log('Warframe Ready');
            this.ready = true;
            callback();
        });
    }

    // SEARCHING
    itemFilter(cell) { // return true or false based on if the item should be included or not
        return levenshtien((!!cell.name ? // if the cell's formattedValue exists i.e. is not empty
            cell.name.toLowerCase().replace(/(\W)?$/gmi, '').replace(/\b((the\s)?((an?)\s)?(is)?){1}\b/gi, '') : // if it does exist, do more filtering
            ''), this.toLowerCase()).similarity > process.env.SIMILARITY_THRESHOLD // the Damerau-Levenshtien distance must greater than the specified number
    }

    search(_msg, query) {
        let results = [];
        results = results.concat(this.items.filter(this.itemFilter, query));
        return results
    }

    static generateFullyQualifiedName(responseItem) {
        return `${String(responseItem.name).trim()}`;
    }

    static resultResponse(result) {
        let response = `The ${this.generateFullyQualifiedName(result)} model is ${evaluateReplace(result.baseRip, { replacement: 'not available yet.', callback: (res) => { return `available at <${res}>.` } })}\n`;
        // let sfmPortCount = !!result.sfm1 + !!result.sfm2 + !!result.sfm3;
        // if (sfmPortCount === 1) {
        //     response += `A SFM port is available at <${[result.sfm1, result.sfm2, result.sfm3].filter((res) => {return !!res}).join('')}>`;
        // } else if (sfmPortCount === 2) {
        //     response += `SFM ports are available at ${[result.sfm1, result.sfm2, result.sfm3].filter((res) => {return !!res}).map((res) => {return `<${res}>`}).join(' and ')}`;
        // } else if (sfmPortCount === 3) {
        //     response += `SFM ports are available at ${[result.sfm1, result.sfm2].map((res) => {return `<${res}>`}).join(', ')}, and <${result.sfm3}>.`
        // }
        
        return response;
    }
}

module.exports = WarframeResponder;