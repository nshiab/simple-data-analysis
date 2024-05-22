import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleWebTable from "../class/SimpleWebTable.js"

export default async function getMax(
    simpleWebTable: SimpleWebTable,
    column: string
) {
    const queryResult = await queryDB(
        simpleWebTable,
        `SELECT MAX("${column}") AS valueForGetMax FROM ${simpleWebTable.name}`,
        mergeOptions(simpleWebTable, {
            table: simpleWebTable.name,
            returnDataFrom: "query",
            method: "getMax()",
            parameters: { column },
        })
    )

    if (!queryResult) {
        throw new Error("No queryResults")
    }

    const result = queryResult[0].valueForGetMax

    simpleWebTable.debug && console.log("max:", result)

    return result
}
