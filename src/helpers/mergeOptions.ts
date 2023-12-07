import SimpleNodeDB from "../class/SimpleNodeDB"
import SimpleDB from "../class/SimpleDB.js"

export default function mergeOptions(
    simpleDB: SimpleDB | SimpleNodeDB,
    options: {
        table: string | null
        nbRowsToLog?: number
        returnDataFrom?: "query" | "none"
        debug?: boolean
    }
): {
    table: string | null
    nbRowsToLog: number
    returnDataFrom: "query" | "none"
    debug: boolean
    bigIntToInt: boolean
} {
    return {
        table: options.table,
        nbRowsToLog: options.nbRowsToLog ?? simpleDB.nbRowsToLog,
        returnDataFrom: options.returnDataFrom ?? "none",
        debug: options.debug ?? simpleDB.debug,
        bigIntToInt: simpleDB.bigIntToInt ?? false,
    }
}
