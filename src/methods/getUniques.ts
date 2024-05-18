import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleWebDB from "../class/SimpleWebDB.js"

export default async function getUniques(
    SimpleWebDB: SimpleWebDB,
    table: string,
    column: string
) {
    const queryResult = await queryDB(
        SimpleWebDB,
        `SELECT DISTINCT "${column}" FROM ${table} ORDER BY ${column} ASC`,
        mergeOptions(SimpleWebDB, {
            table,
            returnDataFrom: "query",
            method: "getUniques()",
            parameters: { table, column },
        })
    )

    if (!queryResult) {
        throw new Error("No result.")
    }

    const uniques = queryResult.map((d) => d[column])

    SimpleWebDB.debug && console.log("uniques:", uniques)

    return uniques
}
