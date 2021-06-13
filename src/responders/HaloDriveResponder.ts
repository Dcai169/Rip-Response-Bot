import { Entry, haloEntry, overridePair } from "../types";
import { BaseResponder } from "./BaseResponder";
import { DriveResponderBase, drive } from "./DriveResponderBase";
const queryOverrides: overridePair[] = JSON.parse(require('fs').readFileSync(`${__dirname}/../config/query_overrides.json`, 'utf8')).halo;

export class HaloDriveResponder extends DriveResponderBase {
    items: Map<string, haloEntry[]>;
    recursionLimit: number;

    constructor() {
        super('13yzFdyxeBHBOql4GOXmaFfQMDD1ehgTZ', 'halo', '365611267374841856');
        this.recursionLimit = 2;

        console.time('findItems');
        this.loadItems(this.driveRoot, '').then(() => {
            this.ready = true;
            console.timeEnd('findItems');
            setTimeout(() => {
                this.items.forEach((folder, key) => {
                    console.log(key);
                    console.table(folder);
                });
            }, 1000);
        });
    }

    resetIndexes(): void {
        this.ready = false;
        this.items = new Map([
            ['Halo CE', []],
            ['Halo 2', []],
            ['Halo 2 Anniversary', []],
            ['Halo 3', []],
            ['Halo 3: ODST', []],
            ['Halo Reach', []],
            ['Halo 4', []],
            ['Halo 5', []],
            ['Halo Wars Definitive Edition', []],
            ['Halo Wars 2', []],
            ['Halo Custom Edition', []],
            ['Halo Online', []]
        ]);
    }

    async loadItems(parentFolderId: string, folderName: string, recursionDepth?: number) {
        return new Promise<void>((resolve, reject) => {
            try {
                drive.files.list({
                    q: `'${parentFolderId}' in parents and (mimeType = 'application/vnd.google-apps.folder' or mimeType = 'application/rar' or mimeType = 'application/x-zip-compressed' or mimeType = 'application/x-7z-compressed')`,
                    fields: 'files(name, id, mimeType, webViewLink, parents)'
                }).then((res) => {
                    recursionDepth = recursionDepth ?? 0;

                    res.data.files.forEach((file, index, arr) => {
                        if (recursionDepth <= this.recursionLimit && file.mimeType === 'application/vnd.google-apps.folder') {
                            this.loadItems(file.id, (file.parents.includes(this.driveRoot) ? file.name: folderName), recursionDepth += 1).then(resolve);
                        } else {
                            folderName = folderName.replace(/\[.*\]/gmi, '').trim();
                            this.items.get(folderName)?.push({ name: file.name, link: file.webViewLink, game: folderName });
                        }
                    });
                });

                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    search(query: string, options?: { game: string; }): Entry[] {
        let game = options.game;
        query = query.toLowerCase();

        throw new Error('Method not implemented.');
    }

    generateQualifierString(game: string) {
        return (game ? `${game} ` : '');
    }

    generateFullyQualifiedName(responseItem: haloEntry) {
        return `${this.generateQualifierString(responseItem.game)}${responseItem.name}`;
    }
}