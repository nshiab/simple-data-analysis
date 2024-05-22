import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleWebTable from "../class/SimpleWebTable.js"

export default async function getMin(
    simpleWebTable: SimpleWebTable,
    column: string
) {
    const queryResult = await queryDB(
        simpleWebTable,
        `SELECT MIN("${column}") AS valueForGetMin FROM ${simpleWebTable.name}`,
        mergeOptions(simpleWebTable, {
            table: simpleWebTable.name,
            returnDataFrom: "query",
            method: "getMin()",
            parameters: { column },
        })
    )

    if (!queryResult) {
        throw new Error("No queryResults")
    }
    const result = queryResult[0].valueForGetMin

    simpleWebTable.debug && console.log("min:", result)

    return result
}
