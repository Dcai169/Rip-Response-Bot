require('dotenv').config({ path: './config.env' });

class itemArray {
    constructor(doc) {
        this.doc = doc;
        this.resetArray() // or create it in this case
        
        const KEY = process.env.GSHEETAPI;
        this.doc.useApiKey(KEY);
        this.loadItemInfo();
    }

    resetArray() {
        this.ready = false;
        this.items = {
            hunterArmor: [],
            titanArmor: [],
            warlockArmor: [],
            elseItems: [],
        };
    }

    async initItemObj(sheet, row) {
        return {
            entry: sheet.getCell(row, 0),
            gender: sheet.getCell(row, 2).formattedValue,
            aliases: (sheet.getCell(row, 3).formattedValue ? sheet.getCell(row, 3).formattedValue.split(", ") : [])
        };
    }

    loadItemInfo(callback=()=>{}) {
        // clear arrays
        this.resetArray();

        // get new data
        this.doc.loadInfo().then(() => {
            this.doc.sheetsByIndex.forEach(sheet => { // for each sheet
                sheet.loadCells().then(() => { // load the sheet
                    switch (sheet.title.toLowerCase().split(" ").shift()) {
                        case "hunter":
                            for (let row = 0; row < sheet.rowCount; row++) { // then add the data to the array
                                (async () => {
                                    this.items.hunterArmor.push(await this.initItemObj(sheet, row));
                                })();
                            }
                            break;

                        case "warlock":
                            for (let row = 0; row < sheet.rowCount; row++) { // then add the data to the array
                                (async () => {
                                    this.items.warlockArmor.push(await this.initItemObj(sheet, row));
                                })();
                            }
                            break;

                        case "titan":
                            for (let row = 0; row < sheet.rowCount; row++) { // then add the data to the array
                                (async () => {
                                    this.items.titanArmor.push(await this.initItemObj(sheet, row));
                                })();
                            }
                            break;

                        default:
                            for (let row = 0; row < sheet.rowCount; row++) {
                                (async () => {
                                    this.items.elseItems.push(await (async () => { 
                                        let cell = this.initItemObj(sheet, row);
                                        (await cell).gender = null;
                                        return cell; 
                                    })());
                                })();
                            }
                            break;
                    }
                }).then(console.log(`${sheet.title} indexed`));
            });
            // probably needs to be async
            setTimeout(() => { console.log("Ready\n"); this.ready = true; callback(); }, 5 * 1000);
        });
    }
}

module.exports = itemArray;