import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleDB from "../indexWeb.js"

export default async function getMean(
    simpleDB: SimpleDB,
    table: string,
    column: string,
    options: {
        decimals?: number
        debug?: boolean
    } = {}
) {
    ;(options.debug || simpleDB.debug) && console.log("\ngetMean()")

    const queryResult = await queryDB(
        simpleDB,
        typeof options.decimals === "number"
            ? `SELECT ROUND(AVG("${column}"), ${options.decimals}) AS valueForGetMean FROM ${table}`
            : `SELECT AVG("${column}") AS valueForGetMean FROM ${table}`,
        mergeOptions(simpleDB, { ...options, table, returnDataFrom: "query" })
    )

    if (!queryResult) {
        throw new Error("No queryResults")
    }

    return queryResult[0].valueForGetMean
}
