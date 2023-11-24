import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import { SimpleDB } from "../indexWeb.js"

export default async function getValues(
    simpleDB: SimpleDB,
    table: string,
    column: string,
    options: {
        debug?: boolean
        nbRowsToLog?: number
    } = {}
) {
    ;(options.debug || simpleDB.debug) && console.log("\ngetValues()")

    const queryResult = await queryDB(
        simpleDB,
        `SELECT ${column} FROM ${table}`,
        mergeOptions(simpleDB, {
            ...options,
            table,
            returnDataFrom: "query",
        })
    )
    if (!queryResult) {
        throw new Error("No result")
    }

    const values = queryResult.map((d) => d[column])

    ;(options.debug || simpleDB.debug) && console.log("\nvalues:", values)

    return values
}
