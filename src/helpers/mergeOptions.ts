import SimpleNodeDB from "../class/SimpleNodeDB"
import SimpleWebDB from "../class/SimpleWebDB.js"

export default function mergeOptions(
    SimpleWebDB: SimpleWebDB | SimpleNodeDB,
    options: {
        table: string | null
        method: string | null
        parameters: { [key: string]: unknown } | null
        nbRowsToLog?: number
        returnDataFrom?: "query" | "none"
        debug?: boolean
    }
): {
    table: string | null
    method: string | null
    parameters: { [key: string]: unknown } | null
    nbRowsToLog: number
    returnDataFrom: "query" | "none"
    debug: boolean
    bigIntToInt: boolean
} {
    return {
        table: options.table,
        method: options.method,
        parameters: options.parameters,
        nbRowsToLog: options.nbRowsToLog ?? SimpleWebDB.nbRowsToLog,
        returnDataFrom: options.returnDataFrom ?? "none",
        debug: options.debug ?? SimpleWebDB.debug,
        bigIntToInt: SimpleWebDB.bigIntToInt ?? false,
    }
}
