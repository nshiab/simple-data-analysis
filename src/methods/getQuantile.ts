import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleWebTable from "../class/SimpleWebTable.js"

export default async function getQuantile(
    simpleWebTable: SimpleWebTable,
    column: string,
    quantile: number,
    options: {
        decimals?: number
    } = {}
) {
    const queryResult = await queryDB(
        simpleWebTable,
        typeof options.decimals === "number"
            ? `SELECT ROUND(QUANTILE_CONT(${column}, ${quantile}), ${options.decimals}) AS valueForGetQuantile FROM ${simpleWebTable.name}`
            : `SELECT QUANTILE_CONT(${column}, ${quantile}) AS valueForGetQuantile FROM ${simpleWebTable.name}`,
        mergeOptions(simpleWebTable, {
            table: simpleWebTable.name,
            returnDataFrom: "query",
            method: "getQuantile()",
            parameters: { column, quantile, options },
        })
    )

    if (!queryResult) {
        throw new Error("No queryResults")
    }

    const result = queryResult[0].valueForGetQuantile
    simpleWebTable.debug && console.log("quantile:", result)
    return result as number
}
