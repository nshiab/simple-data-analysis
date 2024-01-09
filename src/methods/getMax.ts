import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleDB from "../class/SimpleDB.js"

export default async function getMax(
    simpleDB: SimpleDB,
    table: string,
    column: string
) {
    const queryResult = await queryDB(
        simpleDB,
        `SELECT MAX("${column}") AS valueForGetMax FROM ${table}`,
        mergeOptions(simpleDB, {
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

    simpleDB.debug && console.log("max:", result)

    return result
}
