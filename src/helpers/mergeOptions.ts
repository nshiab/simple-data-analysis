import SimpleNodeDB from "../class/SimpleNodeDB"
import { SimpleDB } from "../indexWeb"

export default function mergeOptions(
    simpleDB: SimpleDB | SimpleNodeDB,
    options: {
        returnDataFrom?: "query" | "table" | "none"
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
    }
) {
    return {
        table: options.table,
        returnDataFrom: options.returnDataFrom ?? "none",
        nbRowsToLog: options.nbRowsToLog ?? simpleDB.nbRowsToLog,
        returnedDataModifier: options.returnedDataModifier,
        debug: options.debug ?? simpleDB.debug,
    }
}
