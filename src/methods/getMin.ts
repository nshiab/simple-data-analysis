import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleDB from "../class/SimpleDB.js"

export default async function getMin(
    simpleDB: SimpleDB,
    table: string,
    column: string
) {
    const queryResult = await queryDB(
        simpleDB,
        `SELECT MIN("${column}") AS valueForGetMin FROM ${table}`,
        mergeOptions(simpleDB, {
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

    simpleDB.debug && console.log("min:", result)

    return result
}
