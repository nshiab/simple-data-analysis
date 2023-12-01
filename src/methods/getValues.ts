import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleDB from "../indexWeb.js"

export default async function getValues(
    simpleDB: SimpleDB,
    table: string,
    column: string
) {
    simpleDB.debug && console.log("\ngetValues()")
    simpleDB.debug && console.log("parameters:", { table, column })

    const queryResult = await queryDB(
        simpleDB,
        `SELECT ${column} FROM ${table}`,
        mergeOptions(simpleDB, {
            table,
            returnDataFrom: "query",
        })
    )
    if (!queryResult) {
        throw new Error("No result")
    }

    const values = queryResult.map((d) => d[column])

    simpleDB.debug && console.log("\nvalues:", values)

    return values
}
