import { BaseResponder } from "./BaseResponder";
import { google } from 'googleapis';

const scopes = ['https://www.googleapis.com/auth/drive'];
let credentials: { [key: string]: string } = null;

try {
    credentials = JSON.parse(require('fs').readFileSync(`${__dirname}/../config/client_secret.json`, 'utf8'));
} catch (error) {
    if (error.code === 'ENOENT') {
        credentials = {
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY
        }
    } else {
        throw error;
    }
} finally {
    if (!credentials) {
        throw new Error('Missing client_email and/or private_key');
    }
}

export const drive = google.drive({ version: 'v3', auth: new google.auth.JWT(credentials.client_email, null, credentials.private_key, scopes) });

export abstract class DriveResponderBase extends BaseResponder {
    driveRoot: string;

    constructor(driveRoot: string, game: string, ownerId: string | string[]) {
        super(game, ownerId);
        this.driveRoot = driveRoot;
        this.resetIndexes();
    }

    abstract resetIndexes(): void

    abstract loadItems(parentFolderId: string, folderName: string, recursionDepth: number): Promise<any>
}