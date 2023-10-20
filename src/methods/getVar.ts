import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import { SimpleDB } from "../indexWeb.js"

export default async function getVar(
    simpleDB: SimpleDB,
    table: string,
    column: string,
    options: {
        decimals?: number
        debug?: boolean
    } = {}
) {
    ;(options.debug || simpleDB.debug) && console.log("\ngetVar()")

    const queryResult = await queryDB(
        simpleDB.connection,
        simpleDB.runQuery,
        typeof options.decimals === "number"
            ? `SELECT ROUND(VARIANCE("${column}"), ${options.decimals}) AS valueForGetVar FROM ${table}`
            : `SELECT VARIANCE("${column}") AS valueForGetVar FROM ${table}`,
        mergeOptions(simpleDB, { ...options, table, returnDataFrom: "query" })
    )

    if (!queryResult) {
        throw new Error("No queryResults")
    }

    return queryResult[0].valueForGetVar
}
