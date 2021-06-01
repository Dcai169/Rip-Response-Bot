require('dotenv').config({ path: './config.env' });
import { Entry } from 'src/types.js';
import { evaluateReplace } from '../evaluateReplace.js';

export abstract class BaseResponder {
    game: string;
    ready: boolean;
    ownerId: string[];

    constructor(game: string, ownerId: string | string[]) {
        this.game = game;
        this.ownerId = (typeof ownerId === "string" ? [ownerId] : ownerId);
    }

    // search indexes for provided query
    abstract search(query: string, options?: {[key: string]: string}): Entry[];

    // RESPONDING
    static capitalizeWord(word: string) {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }

    // return a string with all qualifiers i.e. 'male warlock'
    abstract generateQualifierString(item: any, options?: {[key: string]: any}): string;

    // return a string that includes all qualifiers and the item name i.e. 'male warlock seventh seraph helm'
    abstract generateFullyQualifiedName(item: any): string;

    static resultResponse(result: any, responderClass: BaseResponder) {
        let name = responderClass.generateFullyQualifiedName(result);
        return `${name}: ${evaluateReplace(result.cell.hyperlink, { replacement: '❌', callback: (res: string) => { return `✅ <${res}>` } })}`;
    }

    static fallbackResponse() {
        return 'No results found.';
    }

    static respond(results: any[], responderClass: BaseResponder) {
        let response = '';
        // generate response text
        if (results) {
            if (results.length === 1) {
                response = BaseResponder.resultResponse(results[0], responderClass); 
            } else if (results.length === 0) { // fall back if no result
                response = BaseResponder.fallbackResponse();
            } else { // TODO: If an entry matches the query with 100% similarity, respond with only that entry
                response = 'Your query returned multiple results.\n'
                results.forEach((res) => {
                    response += `${BaseResponder.resultResponse(res, responderClass)}\n`;
                });
            }
        }

        return response;
    }
}
