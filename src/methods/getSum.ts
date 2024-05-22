import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleWebTable from "../class/SimpleWebTable.js"

export default async function getSum(
    simpleWebTable: SimpleWebTable,
    column: string
) {
    const queryResult = await queryDB(
        simpleWebTable,
        `SELECT SUM("${column}") AS valueForGetSum FROM ${simpleWebTable.name}`,
        mergeOptions(simpleWebTable, {
            table: simpleWebTable.name,
            returnDataFrom: "query",
            method: "getSum()",
            parameters: { column },
        })
    )

    if (!queryResult) {
        throw new Error("No queryResults")
    }

    const result = queryResult[0].valueForGetSum

    simpleWebTable.debug && console.log("sum:", result)

    return result as number
}
