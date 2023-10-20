import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import { SimpleDB } from "../indexWeb.js"

export default async function getSkew(
    simpleDB: SimpleDB,
    table: string,
    column: string,
    options: {
        decimals?: number
        debug?: boolean
    } = {}
) {
    ;(options.debug || simpleDB.debug) && console.log("\ngetSkew()")

    const queryResult = await queryDB(
        simpleDB.connection,
        simpleDB.runQuery,
        typeof options.decimals === "number"
            ? `SELECT ROUND(SKEWNESS("${column}"), ${options.decimals}) AS valueForGetSkew FROM ${table}`
            : `SELECT SKEWNESS("${column}") AS valueForGetSkew FROM ${table}`,
        mergeOptions(simpleDB, { ...options, table, returnDataFrom: "query" })
    )

    if (!queryResult) {
        throw new Error("No queryResults")
    }

    return queryResult[0].valueForGetSkew
}
