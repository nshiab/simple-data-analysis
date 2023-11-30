import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleDB from "../indexWeb.js"

export default async function getUniques(
    simpleDB: SimpleDB,
    table: string,
    column: string
) {
    simpleDB.debug && console.log("\ngetUniques()")

    const queryResult = await queryDB(
        simpleDB,
        `SELECT DISTINCT ${column} FROM ${table} ORDER BY ${column} ASC`,
        mergeOptions(simpleDB, {
            table,
            returnDataFrom: "query",
        })
    )

    if (!queryResult) {
        throw new Error("No result.")
    }

    const uniques = queryResult.map((d) => d[column])

    simpleDB.debug && console.log("\nuniques:", uniques)

    return uniques
}
