import SimpleNodeDB from "../class/SimpleNodeDB"
import { SimpleDB } from "../indexWeb"

export default function mergeOptions(
    simpleDB: SimpleDB | SimpleNodeDB,
    options: {
        returnDataFrom?: "query" | "table" | "none"
        verbose?: boolean
        table: string | null
        nbRowsToLog?: number
        returnedDataModifier?: (
            rows: {
                [key: string]: number | string | Date | boolean | null
            }[]
        ) => {
            [key: string]: number | string | Date | boolean | null
        }[]
        debug?: boolean
        noTiming?: boolean
        justQuery?: boolean
    }
) {
    return {
        verbose: simpleDB.verbose || (options.verbose ?? false),
        table: options.table,
        returnDataFrom: options.returnDataFrom ?? "none",
        nbRowsToLog: options.nbRowsToLog ?? simpleDB.nbRowsToLog,
        returnedDataModifier: options.returnedDataModifier,
        debug: simpleDB.debug,
        noTiming: options.noTiming ?? false,
        justQuery: options.justQuery ?? false,
    }
}
