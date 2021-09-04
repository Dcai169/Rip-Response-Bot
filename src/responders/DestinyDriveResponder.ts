import { evaluateReplace } from '../evaluateReplace';
import { DestinyClassArray, DestinyClassUnion, destinyEntry, GenderArray, GenderUnion, overridePair } from "../types";
import { BaseResponder } from "./BaseResponder";
import { DriveResponderBase, drive } from "./DriveResponderBase";
const queryOverrides: overridePair[] = JSON.parse(require('fs').readFileSync(`${__dirname}/../config/query_overrides.json`, 'utf8')).destiny;

export class DestinyDriveResponder extends DriveResponderBase {
    items: Map<string, destinyEntry[]>;

    constructor() {
        super('14Ry-piQtH3j6MlfoVLfFfu98c4pcTJUb', 'destiny', '461093992499773440');

        this.items = new Map();

        this.loadItems(this.driveRoot, '').then(() => {
            this.ready = true;
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

        try {
            let files = await drive.files.list({
                q: `'${parentFolderId}' in parents and (mimeType = 'application/vnd.google-apps.folder' or mimeType = 'application/rar' or mimeType = 'application/x-zip-compressed' or mimeType = 'application/x-7z-compressed')`,
                fields: 'files(name, id, mimeType, webViewLink, parents)'
            })
            files.data.files.forEach((file, index, arr) => {
                if (file.mimeType === 'application/vnd.google-apps.folder') {
                    if (file.parents[0] === this.driveRoot && ![...this.items.keys()].includes(file.name)) { this.items.set(file.name, []) }
                    this.loadItems(file.id, (file.parents.includes(this.driveRoot) ? file.name : folderName)).then(() => { Promise.resolve() });
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
                }
            });
        } catch(error) {
            return Promise.reject(error);
        } finally {
            return Promise.resolve();
        }
    }

resetIndexes() {
    this.ready = false;
    this.items = new Map();
}

search(query: string, options ?: { armorClass: string, gender: string }): destinyEntry[] {
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
        return `${this.generateQualifierString(responseItem.gender, { armorClass: responseItem.armorClass })}${String(responseItem.name).trim()}`;
    }
}