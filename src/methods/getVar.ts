import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleDB from "../indexWeb.js"

export default async function getVar(
    simpleDB: SimpleDB,
    table: string,
    column: string,
    options: {
        decimals?: number
    } = {}
) {
    simpleDB.debug && console.log("\ngetVar()")
    simpleDB.debug && console.log("parameters:", { table, column, options })

    const queryResult = await queryDB(
        simpleDB,
        typeof options.decimals === "number"
            ? `SELECT ROUND(VARIANCE("${column}"), ${options.decimals}) AS valueForGetVar FROM ${table}`
            : `SELECT VARIANCE("${column}") AS valueForGetVar FROM ${table}`,
        mergeOptions(simpleDB, { table, returnDataFrom: "query" })
    )

    if (!queryResult) {
        throw new Error("No queryResults")
    }

    return queryResult[0].valueForGetVar
}
