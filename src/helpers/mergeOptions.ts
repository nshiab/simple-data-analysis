import SimpleNodeDB from "../class/SimpleNodeDB"
import { SimpleDB } from "../indexWeb"

export default function mergeOptions(
    simpleDB: SimpleDB | SimpleNodeDB,
    options: {
        table: string | null
        nbRowsToLog?: number
        returnDataFrom?: "query" | "table" | "none"
        debug?: boolean
        returnedDataModifier?: (
            rows: {
                [key: string]: number | string | Date | boolean | null
            }[]
        ) => {
            [key: string]: number | string | Date | boolean | null
        }[]
    }
): {
    table: string | null
    nbRowsToLog: number
    returnDataFrom: "query" | "table" | "none"
    debug: boolean
    returnedDataModifier:
        | ((
              rows: {
                  [key: string]: number | string | Date | boolean | null
              }[]
          ) => {
              [key: string]: number | string | Date | boolean | null
          }[])
        | null
    bigIntToInt: boolean
} {
    return {
        table: options.table,
        nbRowsToLog: options.nbRowsToLog ?? simpleDB.nbRowsToLog,
        returnDataFrom: options.returnDataFrom ?? "none",
        debug: options.debug ?? simpleDB.debug,
        returnedDataModifier: options.returnedDataModifier ?? null,
        bigIntToInt: simpleDB.bigIntToInt ?? false,
    }
}
