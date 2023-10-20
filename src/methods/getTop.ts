import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import { SimpleDB } from "../indexWeb.js"

export default async function getTop(
    simpleDB: SimpleDB,
    table: string,
    count: number,
    options: {
        debug?: boolean
    } = {}
) {
    ;(options.debug || simpleDB.debug) && console.log("\ngetTop()")

    const rows = await queryDB(
        simpleDB.connection,
        simpleDB.runQuery,
        `SELECT * FROM ${table} LIMIT ${count}`,
        mergeOptions(simpleDB, { ...options, table, returnDataFrom: "query" })
    )

    if (!rows) {
        throw new Error("no rows")
    }

    return rows
}
