import { GoogleSpreadsheetCell } from "google-spreadsheet";

export interface overridePair { replaces: string[], replacement: string }
export let GenderUnion: 'male' | 'female'
export const GenderArray = ['male', 'female']

export interface Entry { name: string, link: string }
export interface haloEntry extends Entry { game: string }
export interface warframeEntry extends Entry { skins: GoogleSpreadsheetCell, sfm1: GoogleSpreadsheetCell, sfm2: GoogleSpreadsheetCell, sfm3: GoogleSpreadsheetCell }

export let DestinyClassUnion: 'titan' | 'hunter' | 'warlock' 
export interface destinyEntry extends Entry { gender?: typeof GenderUnion, armorClass?: typeof DestinyClassUnion, aliases?: string[] }
export const DestinyClassArray = ['titan', 'hunter', 'warlock']

