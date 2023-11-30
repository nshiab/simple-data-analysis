import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleDB from "../indexWeb.js"

export default async function getLength(simpleDB: SimpleDB, table: string) {
    simpleDB.debug && console.log("\ngetLength()")

    const queryResult = await queryDB(
        simpleDB,
        `SELECT COUNT(*) FROM ${table}`,
        mergeOptions(simpleDB, { table, returnDataFrom: "query" })
    )

    if (!queryResult) {
        throw new Error("No result")
    }
    const length = queryResult[0]["count_star()"] as number

    simpleDB.debug && console.log("\nlength:", length)

    return length
}
