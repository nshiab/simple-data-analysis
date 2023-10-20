import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import stringToArray from "../helpers/stringToArray.js"
import { SimpleDB } from "../indexWeb.js"
import removeMissingQuery from "./removeMissingQuery.js"

export default async function removeMissing(
    simpleDB: SimpleDB,
    table: string,
    columns: string | string[] = [],
    options: {
        otherMissingValues?: (string | number)[]
        invert?: boolean
        returnDataFrom?: "query" | "table" | "none"
        debug?: boolean
        nbRowsToLog?: number
    } = {
        otherMissingValues: ["undefined", "NaN", "null", ""],
    }
) {
    ;(options.debug || simpleDB.debug) && console.log("\nremoveMissing()")

    const types = await simpleDB.getTypes(table)
    const allColumns = Object.keys(types)

    options.otherMissingValues = options.otherMissingValues ?? [
        "undefined",
        "NaN",
        "null",
        "",
    ]

    columns = stringToArray(columns)

    return await queryDB(
        simpleDB.connection,
        simpleDB.runQuery,
        removeMissingQuery(
            table,
            allColumns,
            types,
            columns.length === 0 ? allColumns : columns,
            options
        ),
        mergeOptions(simpleDB, { ...options, table })
    )
}
