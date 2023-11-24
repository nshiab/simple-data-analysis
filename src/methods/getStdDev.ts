import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import { SimpleDB } from "../indexWeb.js"

export default async function getStdDev(
    simpleDB: SimpleDB,
    table: string,
    column: string,
    options: {
        decimals?: number
        debug?: boolean
    } = {}
) {
    ;(options.debug || simpleDB.debug) && console.log("\ngetStdDev()")

    const queryResult = await queryDB(
        simpleDB,
        typeof options.decimals === "number"
            ? `SELECT ROUND(STDDEV("${column}"), ${options.decimals}) AS valueForGetStdDev FROM ${table}`
            : `SELECT STDDEV("${column}") AS valueForGetStdDev FROM ${table}`,
        mergeOptions(simpleDB, { ...options, table, returnDataFrom: "query" })
    )

    if (!queryResult) {
        throw new Error("No queryResults")
    }

    return queryResult[0].valueForGetStdDev
}
