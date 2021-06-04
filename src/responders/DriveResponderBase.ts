import { BaseResponder } from "./BaseResponder";
import { google } from 'googleapis';

const credentials = JSON.parse(require('fs').readFileSync(`${__dirname}/../config/client_secret.json`, 'utf8'));
const scopes = ['https://www.googleapis.com/auth/drive'];
export const drive = google.drive({version: 'v3', auth: new google.auth.JWT(credentials.client_email, null, credentials.private_key, scopes)});

export abstract class DriveResponderBase extends BaseResponder {
    driveRoot: string;
    
    constructor(driveRoot: string, game: string, ownerId: string | string[]) {
        super(game, ownerId);
        this.driveRoot = driveRoot;
        this.resetIndexes();
    }

    abstract resetIndexes(): void

    abstract findItems(parentFolderId: string, folder?: string): void
}