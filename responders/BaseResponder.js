require('dotenv').config({ path: './config.env' });
const levenshtien = require('damerau-levenshtein');
const evaluateReplace = require('../evaluateReplace.js');

class BaseResponder {
    constructor(doc, game, ownerId, headerSize = 12) {
        if (new.target === BaseResponder) {
            throw new TypeError('BaseResponder instances should not be constructed directly!');
        }

        this.doc = doc;
        this.game = game;
        this.ownerId = ownerId;
        this.headerSize = headerSize;
        
        const KEY = process.env.GSHEETAPI;
        this.doc.useApiKey(KEY);
        this.loadIndexes();
        // this.readyListener = (val) => {};
    }

    // get ready() {
    //     return this.ready;
    // }

    // set ready(val) {
    //     this.ready = !!val;
    //     this.readyListener(val);
    // }

    // INDEXING
    resetIndexes() {
        this.ready = false;

    }

    async createItemObj(sheet, row) {
        // create an object that represents an item
    }

    static async getItem(sheet, row, responder, headerSize) {
        if (!!sheet.getCell(row, 0).formattedValue && sheet.getCell(row, 0).effectiveFormat.textFormat.fontSize < headerSize) { // Header and empty row detection
            // console.log(responder.createItemObj)
            return await responder.createItemObj(sheet, row);
        }
    }

    loadIndexes(callback = () => { }) {
        // clear arrays
        this.resetIndexes();

        // get new data
        this.doc.loadInfo().then(() => {
            // do things
        });
    }

    // SEARCHING
    itemFilter(cell) { // return true or false based on if the item should be included or not
        return levenshtien((!!cell.entry.formattedValue ? // if the cell's formattedValue exists i.e. is not empty
            cell.entry.formattedValue.toLowerCase().replace(/(\W)?$/gmi, '').replace(/\b((the\s)?((an?)\s)?(is)?){1}\b/gi, '') : // if it does exist, do more filtering
            ''), this.toLowerCase()).similarity > process.env.SIMILARITY_THRESHOLD // the Damerau-Levenshtien distance must greater than the specified number
    }

    search() {
        // search indexes for provided query
    }

    // RESPONDING
    static capitalizeWord(word) {
        if (typeof word !== 'string') { return '' }
        return word.charAt(0).toUpperCase() + word.slice(1);
    }

    static addParam(filterResults, param, tag) {
        filterResults.forEach((item) => { item[param] = tag; });
        return filterResults;
    }

    static generateQualifierString() {
        // return a string with all qualifiers i.e. 'male warlock'
    }

    static generateFullyQualifiedName() {
        // return a string that includes all qualifiers and the item name i.e. 'male warlock seventh seraph'
    }

    static resultResponse(result, responderClass) {
        let name = responderClass.generateFullyQualifiedName(result)
        return `${(name.substring(0, 4) === 'The ' ? '' : 'The ')}${name} model is ${evaluateReplace(result.entry.hyperlink, { replacement: 'not available yet.', callback: (res) => { return `available at <${res}>.` } })}`;
    }

    static fallbackResponse(query) {
        return;
    }

    static respond(results, responderClass) {
        let response = '';
        // generate response text
        if (results) {
            if (results.length === 1) {
                response = responderClass.resultResponse(results[0], responderClass); 
            } else if (results.length === 0) { // fall back if no result
                response = responderClass.fallbackResponse();
            } else { // TODO: If an entry matches the query with 100% similarity, respond with only that entry
                response = 'Your query returned multiple results.\n'
                results.forEach((res) => {
                    response += `${responderClass.resultResponse(res, responderClass)}\n`;
                });
            }
        }

        return response;
    }
}

module.exports = BaseResponder;