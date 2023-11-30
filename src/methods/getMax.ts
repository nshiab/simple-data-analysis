import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleDB from "../indexWeb.js"

export default async function getMax(
    simpleDB: SimpleDB,
    table: string,
    column: string
) {
    simpleDB.debug && console.log("\ngetMax()")

    const queryResult = await queryDB(
        simpleDB,
        `SELECT MAX("${column}") AS valueForGetMax FROM ${table}`,
        mergeOptions(simpleDB, { table, returnDataFrom: "query" })
    )

    if (!queryResult) {
        throw new Error("No queryResults")
    }

    return queryResult[0].valueForGetMax
}
