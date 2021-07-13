require('dotenv').config({ path: './config.env' });
import * as levenshtein from 'damerau-levenshtein';
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
    abstract generateFullyQualifiedName(item: Entry): string;

    static resultResponse(result: Entry, responderClass: BaseResponder) {
        let name = responderClass.generateFullyQualifiedName(result);
        return `${name}: ${evaluateReplace(result.link, { replacement: '❌', callback: (res: string) => { return `✅ <${res}>` } })}`;
    }

    static fallbackResponse() {
        return 'No results found.';
    }

    static respond(results: Entry[], responderClass: BaseResponder) {
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

    static reduceCompareName(fullName: string) {
        return fullName
            .replace(/\b((the\s)?((an?)\s)?(is)?){1}\b/gi, '')
            .replace(/(set|suit)/gmi, '')
            .replace(/(\W)+/gmi, '')
            .replace(/\[.*\]/gmi, '')
            .trim();
    }

    itemFilter(this: string, entry: Entry): boolean {
        return levenshtein((entry.name ? BaseResponder.reduceCompareName(entry.name.toLowerCase()) : ' '), this).similarity > parseFloat(process.env.SIMILARITY_THRESHOLD) // the Damerau-Levenshtien distance must greater than the specified number || entry.aliases.includes(this.toLowerCase()); // or if the query matches an alias
    }
}
