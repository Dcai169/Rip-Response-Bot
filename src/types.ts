import { GoogleSpreadsheetCell } from "google-spreadsheet";

export interface overridePair { replaces: string[], replacement: string }

export interface Entry { cell: GoogleSpreadsheetCell }
export interface haloEntry extends Entry { game: string }
export interface warframeEntry extends Entry { name: string, skins: GoogleSpreadsheetCell, sfm1: GoogleSpreadsheetCell, sfm2: GoogleSpreadsheetCell, sfm3: GoogleSpreadsheetCell }
export interface destinyEntry extends Entry { gender?: 'male' | 'female', armorClass?: 'titan' | 'hunter' | 'warlock', aliases: string[] }
