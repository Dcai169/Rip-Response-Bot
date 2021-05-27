import { GoogleSpreadsheetCell } from "google-spreadsheet";

export interface overridePair { replaces: string[], replacement: string }

export interface haloEntry { cell: GoogleSpreadsheetCell, game: string }
export interface warframeEntry { name: string, baseRip: string, skins: string, sfm1: string, sfm2: string, sfm3: string }
export interface destinyEntry { cell: GoogleSpreadsheetCell, gender?: 'male' | 'female', armorClass?: 'titan' | 'hunter' | 'warlock', aliases: string[] }
