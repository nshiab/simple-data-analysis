import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleWebDB from "../class/SimpleWebDB.js"

export default async function getMin(
    SimpleWebDB: SimpleWebDB,
    table: string,
    column: string
) {
    const queryResult = await queryDB(
        SimpleWebDB,
        `SELECT MIN("${column}") AS valueForGetMin FROM ${table}`,
        mergeOptions(SimpleWebDB, {
            table,
            returnDataFrom: "query",
            method: "getMin()",
            parameters: { table, column },
        })
    )

    if (!queryResult) {
        throw new Error("No queryResults")
    }
    const result = queryResult[0].valueForGetMin

    SimpleWebDB.debug && console.log("min:", result)

    return result
}
