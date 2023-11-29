import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleDB from "../indexWeb.js"

export default async function getUniques(
    simpleDB: SimpleDB,
    table: string,
    column: string,
    options: {
        debug?: boolean
        nbRowsToLog?: number
    } = {}
) {
    ;(options.debug || simpleDB.debug) && console.log("\ngetUniques()")

    const queryResult = await queryDB(
        simpleDB,
        `SELECT DISTINCT ${column} FROM ${table} ORDER BY ${column} ASC`,
        mergeOptions(simpleDB, {
            ...options,
            table,
            returnDataFrom: "query",
        })
    )

    if (!queryResult) {
        throw new Error("No result.")
    }

    const uniques = queryResult.map((d) => d[column])

    ;(options.debug || simpleDB.debug) && console.log("\nuniques:", uniques)

    return uniques
}
