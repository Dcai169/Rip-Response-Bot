import { evaluateReplace } from '../evaluateReplace';
import { DestinyClassArray, DestinyClassUnion, destinyEntry, GenderArray, GenderUnion, overridePair } from "../types";
import { BaseResponder } from "./BaseResponder";
import { DriveResponderBase, drive } from "./DriveResponderBase";
const queryOverrides: overridePair[] = JSON.parse(require('fs').readFileSync(`${__dirname}/../config/query_overrides.json`, 'utf8')).destiny;

export class DestinyDriveResponder extends DriveResponderBase {
    items: Map<string, destinyEntry[]>;

    constructor() {
        super('14Ry-piQtH3j6MlfoVLfFfu98c4pcTJUb', 'destiny', '461093992499773440');

        console.time('findItems');
        this.loadItems(this.driveRoot, '').then(() => {
            this.ready = true;
            console.timeEnd('findItems');
            setTimeout(() => {
                this.items.forEach((folder, key) => {
                    console.log(key);
                    console.table(folder);
                });
            }, 20000)
        });
    }

    async loadItems(parentFolderId: string, folderName: string) {
        function reduceItemName(fullName: string) {
            return fullName.split('.')[0]
                .replace('_', ' ')
                .replace(new RegExp('\\((\\d)+\\)', 'gmi'), '')
                .replace('Copy of ', '')
                .replace(new RegExp('(BIOS|Delta|taylor4224|TheSinkingSponge|Reed)', 'gmi'), '')
                .replace(new RegExp('(((\\w*(e[rdl]|s)( fix)?( and)? ?))+( by|-) ?[a-zA-Z0-9-_ ]*( ?([,;:&]) )?)+', 'gmi'), '')
                .replace(new RegExp('(fe)?male', 'gmi'), '')
                .replace(new RegExp('(titan|hunter|warlock)', 'gmi'), '')
                .replace(new RegExp('(\\[\\])|(\\(\\))', 'gmi'), '')
                .replace(new RegExp(' {2,}', 'gmi'), ' ')
                .trim();
        }

        return new Promise<void>((resolve, reject) => {
            try {
                drive.files.list({
                    q: `'${parentFolderId}' in parents and (mimeType = 'application/vnd.google-apps.folder' or mimeType = 'application/rar' or mimeType = 'application/x-zip-compressed' or mimeType = 'application/x-7z-compressed')`,
                    fields: 'files(name, id, mimeType, webViewLink, parents)'
                }).then((res) => {
                    res.data.files.forEach((file, index, arr) => {
                        if (file.mimeType === 'application/vnd.google-apps.folder') {   
                            this.loadItems(file.id, (file.parents.includes(this.driveRoot) ? file.name : folderName)).then(resolve);
                        } else {
                            let itemEntry: destinyEntry = { name: reduceItemName(file.name), link: file.webViewLink }
                            
                            DestinyClassArray.forEach((_class) => {
                                if (file.name.toLowerCase().includes(_class)) {
                                    itemEntry.armorClass = (_class as typeof DestinyClassUnion);
                                }
                            });
            
                            GenderArray.forEach((gender) => {
                                if (file.name.toLowerCase().includes(gender)) {
                                    itemEntry.gender = (gender as typeof GenderUnion);
                                }
                            });
            
                            this.items.get(folderName).push(itemEntry);
    
                            if (index === (arr.length - 1)) {
                                resolve();
                            }
                        }
                    });
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    resetIndexes() {
        this.ready = false;
        this.items = new Map([
            ['Season 14_Splicer', []],
            ['Season 13_Chosen', []],
            ['Season 12_Hunt', []],
            ['Season 11_Arrivals', []],
            ['Season 10_Worthy', []],
            ['Season 9_Dawn', []],
            ['Season 8_Undying', []],
            ['Season 7_Opulence', []],
            ['Season 6_Drifter', []],
            ['Season 5_Forge', []],
            ['Season 4_Outlaw', []],
            ['Season 3_Warmind', []],
            ['Season 2_Curse of Osiris', []],
            ['Season 1_Red War', []],
            ['NPCs', []],
            ['Misc', []],
            ['Holiday Events', []],
            ['Enemy Races', []],
            ['Destiny 1', []],
            ['Shaders', []]
        ]);
    }

    search(query: string, options?: { armorClass: string, gender: string }): destinyEntry[] {
        let armorClass = options.armorClass;
        let gender = options.gender;
        query = query.toLowerCase();

        // check if the query should be overridden
        queryOverrides.forEach((overridePair) => {
            if (overridePair.replaces.includes(query.toLowerCase())) {
                query = overridePair.replacement;
            }
        });

        let results: destinyEntry[] = [];

        this.items.forEach((folder) => {
            results = results.concat(folder.filter(this.itemFilter, query));
        });

        if (gender) {
            results = results.filter((item) => { return !item.gender || item.gender === gender.toLowerCase() });
        }

        if (armorClass) {
            results = results.filter((item) => { return !item.armorClass || item.armorClass === armorClass.toLowerCase() });
        }

        return results;
    }

    // RESPONDING
    generateQualifierString(gender: string, options: { armorClass: string }) {
        return `${evaluateReplace(gender, { replacement: '', callback: (res) => { return `${BaseResponder.capitalizeWord(res)} ` } })}${evaluateReplace(options.armorClass, { replacement: '', callback: (res) => { return `${BaseResponder.capitalizeWord(res)} ` } })}`;
    }

    generateFullyQualifiedName(responseItem: destinyEntry) {
        return `${this.generateQualifierString(responseItem.gender, {armorClass: responseItem.armorClass})}${String(responseItem.name).trim()}`;
    }
}