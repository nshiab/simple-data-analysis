import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleDB from "../indexWeb.js"

export default async function getMedian(
    simpleDB: SimpleDB,
    table: string,
    column: string,
    options: {
        decimals?: number
    } = {}
) {
    simpleDB.debug && console.log("\ngetMedian()")
    simpleDB.debug && console.log("parameters:", { table, column, options })

    const queryResult = await queryDB(
        simpleDB,
        typeof options.decimals === "number"
            ? `SELECT ROUND(MEDIAN("${column}"), ${options.decimals}) AS valueForGetMedian FROM ${table}`
            : `SELECT MEDIAN("${column}") AS valueForGetMedian FROM ${table}`,
        mergeOptions(simpleDB, { table, returnDataFrom: "query" })
    )

    if (!queryResult) {
        throw new Error("No queryResults")
    }

    return queryResult[0].valueForGetMedian
}
