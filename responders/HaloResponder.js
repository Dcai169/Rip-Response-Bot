const BaseResponder = require('./BaseResponder.js');
const evaluateReplace = require('../evaluateReplace.js');

class HaloResponder extends BaseResponder {
    constructor(doc) {
        super(doc);
    }

    static gameRegex = /^(h)?(alo)?(\s)?(\d)?([aceg:]{1,3})?((\s)?((anniversary)?(classic)?(guardians)?(odst)?(reach)?))?/gmi;

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
        // Detect what game the user wants (CE, 2A, Reach, etc)
        let gameToQuery = (() => {
            if (HaloResponder.gameRegex.test(query)) {
                let game = query.match(HaloResponder.gameRegex).shift().replace(/^(h)?(alo)?/gmi, '').toLowerCase();
                if (/\d/.test(game)) { // if is h2, h2a, h3, h3 odst, h4, h5, hw2
                    switch (evaluateReplace(game.match(/[2-5]/), {replacement: []}).shift()) { // match only numbers 2 through 5
                        case '2':
                            if (game.includes('wars')) {
                                return 'Halo Wars 2';
                            } else {
                                if (game.includes('a')) {
                                    return 'Halo 2 Anniversary';
                                } else {
                                    return 'Halo 2 Classic';
                                }
                            }

                        case '3':
                            if (game.includes('odst')) {
                                return 'Halo 3: ODST';
                            } else {
                                return 'Halo 3';
                            }

                        case '4':
                            return 'Halo 4';

                        case '5':
                            return 'Halo 5';

                        default:
                            break;
                    }
                } else { // else hce, hcea, reach, hw
                    if (game.includes('reach')) {
                        return 'Halo Reach';
                    } else if (game.includes('wars')) {
                        return 'Halo Wars';
                    } else { // ce or cea
                        if (game.includes('cea')) {
                            return 'Halo CEA';
                        } else {
                            return 'Halo CE';
                        }
                    }
                }
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

        return results;
    }

    static generateQualifierString(game) {
        return evaluateReplace(game, { replacement: '', callback: (res) => { return `${res} ` } });
    }

    static generateFullyQualifiedName(responseItem) {
        return `${HaloResponder.generateQualifierString(responseItem.game)}${String(responseItem.entry.formattedValue).trim()}`;
    }


}

module.exports = HaloResponder;