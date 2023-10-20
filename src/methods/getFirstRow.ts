import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import { SimpleDB } from "../indexWeb.js"

export default async function getFirstRow(
    simpleDB: SimpleDB,
    table: string,
    options: {
        condition?: string
        debug?: boolean
    } = {}
) {
    ;(options.debug || simpleDB.debug) && console.log("\ngetFirstRow()")
    const queryResult = await queryDB(
        simpleDB.connection,
        simpleDB.runQuery,
        `SELECT * FROM ${table}${
            options.condition ? ` WHERE ${options.condition}` : ""
        } LIMIT 1`,
        mergeOptions(simpleDB, { ...options, table, returnDataFrom: "query" })
    )
    return Array.isArray(queryResult) ? queryResult[0] : queryResult
}
