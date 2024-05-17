import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleDB from "../class/SimpleDB.js"

export default async function getUniques(
    simpleDB: SimpleDB,
    table: string,
    column: string
) {
    const queryResult = await queryDB(
        simpleDB,
        `SELECT DISTINCT "${column}" FROM ${table} ORDER BY ${column} ASC`,
        mergeOptions(simpleDB, {
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

    simpleDB.debug && console.log("uniques:", uniques)

    return uniques
}
