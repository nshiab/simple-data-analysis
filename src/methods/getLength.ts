import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleDB from "../class/SimpleDB.js"

export default async function getLength(simpleDB: SimpleDB, table: string) {
    const queryResult = await queryDB(
        simpleDB,
        `SELECT COUNT(*) FROM ${table}`,
        mergeOptions(simpleDB, {
            table,
            returnDataFrom: "query",
            method: "getLength()",
            parameters: { table },
        })
    )

    if (!queryResult) {
        throw new Error("No result")
    }
    const length = queryResult[0]["count_star()"] as number

    simpleDB.debug && console.log("length:", length)

    return length
}
