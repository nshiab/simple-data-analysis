import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleWebTable from "../class/SimpleWebTable.js"

export default async function getVar(
    simpleWebTable: SimpleWebTable,
    column: string,
    options: {
        decimals?: number
    } = {}
) {
    const queryResult = await queryDB(
        simpleWebTable,
        typeof options.decimals === "number"
            ? `SELECT ROUND(VARIANCE("${column}"), ${options.decimals}) AS valueForGetVar FROM ${simpleWebTable.name}`
            : `SELECT VARIANCE("${column}") AS valueForGetVar FROM ${simpleWebTable.name}`,
        mergeOptions(simpleWebTable, {
            table: simpleWebTable.name,
            returnDataFrom: "query",
            method: "getVar()",
            parameters: { column, options },
        })
    )

    if (!queryResult) {
        throw new Error("No queryResults")
    }

    const result = queryResult[0].valueForGetVar
    simpleWebTable.debug && console.log("variance:", result)
    return result as number
}
