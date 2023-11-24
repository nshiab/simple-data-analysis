import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import { SimpleDB } from "../indexWeb.js"

export default async function getSum(
    simpleDB: SimpleDB,
    table: string,
    column: string,
    options: {
        debug?: boolean
    } = {}
) {
    ;(options.debug || simpleDB.debug) && console.log("\ngetSum()")

    const queryResult = await queryDB(
        simpleDB,
        `SELECT SUM("${column}") AS valueForGetSum FROM ${table}`,
        mergeOptions(simpleDB, { ...options, table, returnDataFrom: "query" })
    )

    if (!queryResult) {
        throw new Error("No queryResults")
    }

    return queryResult[0].valueForGetSum
}
