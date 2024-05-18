import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleWebDB from "../class/SimpleWebDB.js"

export default async function getLength(
    SimpleWebDB: SimpleWebDB,
    table: string
) {
    const queryResult = await queryDB(
        SimpleWebDB,
        `SELECT COUNT(*) FROM ${table}`,
        mergeOptions(SimpleWebDB, {
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

    SimpleWebDB.debug && console.log("length:", length)

    return length
}
