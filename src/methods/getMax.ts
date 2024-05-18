import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleWebDB from "../class/SimpleWebDB.js"

export default async function getMax(
    SimpleWebDB: SimpleWebDB,
    table: string,
    column: string
) {
    const queryResult = await queryDB(
        SimpleWebDB,
        `SELECT MAX("${column}") AS valueForGetMax FROM ${table}`,
        mergeOptions(SimpleWebDB, {
            table,
            returnDataFrom: "query",
            method: "getMax()",
            parameters: { table, column },
        })
    )

    if (!queryResult) {
        throw new Error("No queryResults")
    }

    const result = queryResult[0].valueForGetMax

    SimpleWebDB.debug && console.log("max:", result)

    return result
}
