require('dotenv').config({ path: './config.env' });

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

    generateFullyQualifiedName(){
        // return a string that includes all qualifiers and the item name i.e. "male warlock seventh seraph"
    }

    static fallbackResponse(query){
        // response when nothing is found
    }

    static respond(results) {
        // provide a response given a list of results
    }

    
}

module.exports = BaseResponder;