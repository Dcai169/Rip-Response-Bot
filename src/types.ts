import { GoogleSpreadsheetCell } from "google-spreadsheet";

export interface overridePair { replaces: string[], replacement: string }

export interface haloEntry { entry: GoogleSpreadsheetCell, game: string }
export interface warframeEntry { name: string, baseRip: string, skins: string, sfm1: string, sfm2: string, sfm3: string }