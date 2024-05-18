import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleWebDB from "../class/SimpleWebDB.js"

export default async function getSum(
    SimpleWebDB: SimpleWebDB,
    table: string,
    column: string
) {
    const queryResult = await queryDB(
        SimpleWebDB,
        `SELECT SUM("${column}") AS valueForGetSum FROM ${table}`,
        mergeOptions(SimpleWebDB, {
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

    SimpleWebDB.debug && console.log("sum:", result)

    return result as number
}
