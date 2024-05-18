import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleWebDB from "../class/SimpleWebDB.js"

export default async function getValues(
    SimpleWebDB: SimpleWebDB,
    table: string,
    column: string
) {
    const queryResult = await queryDB(
        SimpleWebDB,
        `SELECT "${column}" FROM ${table}`,
        mergeOptions(SimpleWebDB, {
            table,
            returnDataFrom: "query",
            method: "getValues()",
            parameters: { table, column },
        })
    )
    if (!queryResult) {
        throw new Error("No result")
    }

    const values = queryResult.map((d) => d[column])

    SimpleWebDB.debug && console.log("values:", values)

    return values
}
