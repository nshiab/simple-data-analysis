import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleDB from "../class/SimpleDB.js"

export default async function getSum(
    simpleDB: SimpleDB,
    table: string,
    column: string
) {
    const queryResult = await queryDB(
        simpleDB,
        `SELECT SUM("${column}") AS valueForGetSum FROM ${table}`,
        mergeOptions(simpleDB, {
            table,
            returnDataFrom: "query",
            method: "getSum()",
            parameters: { table, column },
        })
    )

    if (!queryResult) {
        throw new Error("No queryResults")
    }

    const result = queryResult[0].valueForGetSum

    simpleDB.debug && console.log("sum:", result)

    return result as number
}
