import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleDB from "../class/SimpleDB.js"

export default async function getQuantile(
    simpleDB: SimpleDB,
    table: string,
    column: string,
    quantile: number,
    options: {
        decimals?: number
    } = {}
) {
    const queryResult = await queryDB(
        simpleDB,
        typeof options.decimals === "number"
            ? `SELECT ROUND(QUANTILE_CONT("${column}", ${quantile}), ${options.decimals}) AS valueForGetQuantile FROM ${table}`
            : `SELECT QUANTILE_CONT("${column}", ${quantile}) AS valueForGetQuantile FROM ${table}`,
        mergeOptions(simpleDB, {
            table,
            returnDataFrom: "query",
            method: "getQuantile()",
            parameters: { table, column, quantile, options },
        })
    )

    if (!queryResult) {
        throw new Error("No queryResults")
    }

    const result = queryResult[0].valueForGetQuantile
    simpleDB.debug && console.log("quantile:", result)
    return result
}
