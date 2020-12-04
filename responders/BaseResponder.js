require('dotenv').config({ path: './config.env' });
const levenshtien = require("damerau-levenshtein");
const evaluateReplace = require('../evaluateReplace.js');

class BaseResponder {
    constructor(doc){
        this.doc = doc;
        const KEY = process.env.GSHEETAPI;
        this.doc.useApiKey(KEY);
        this.loadIndexes();

        if (new.target === BaseResponder) {
            throw new TypeError("BaseResponder instances should not be constructed directly!");
          }
    }

    // INDEXING
    resetIndexes(){
        this.ready = false;
        
    }

    async createItemObj(sheet, row) {
        // create an object that represents an item
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
            cell.entry.formattedValue.toLowerCase().replace(/(\W)?$/gmi, "").replace(/\b((the\s)?((an?)\s)?(is)?){1}\b/gi, "") : // if it does exist, do more filtering
            ""), this.toLowerCase()).similarity > process.env.SIMILARITY_THRESHOLD // the Damerau-Levenshtien distance must greater than the specified number
    }

    search() {
        // search indexes for provided query
    }

    // RESPONDING
    static capitalizeWord(word) {
        if (typeof word !== 'string') { return '' }
        return word.charAt(0).toUpperCase() + word.slice(1);
    }

    static generateQualifierString() {
        // return a string with all qualifiers i.e. "male warlock"
    }

    static generateFullyQualifiedName(){
        // return a string that includes all qualifiers and the item name i.e. "male warlock seventh seraph"
    }

    static resultResponse(result, responderClass) {
        return `The ${responderClass.generateFullyQualifiedName(result)} model is ${evaluateReplace(result.entry.hyperlink, { replacement: 'not available yet.', callback: (res) => { return `available at <${res}>.` } })}`;
    }

    static fallbackResponse(query){
        return;
    }

    static respond(results, responderClass) {
        let response = "";
        // generate response text
        if (results.length === 1) {
            response = this.resultResponse(results[0], responderClass); // fall back if no result
        } else if (results.length === 0) {
            response = this.fallbackResponse();
        } else { // TODO: If an entry matches the query with 100% similarity, respond with only that entry
            response = "Your query returned multiple results.\n"
            results.forEach((res) => {
                response += `${this.resultResponse(res, responderClass)}\n`;
            });
        }

        return response;
    }
}

module.exports = BaseResponder;