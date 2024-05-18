import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleWebDB from "../class/SimpleWebDB.js"

export default async function getQuantile(
    SimpleWebDB: SimpleWebDB,
    table: string,
    column: string,
    quantile: number,
    options: {
        decimals?: number
    } = {}
) {
    const queryResult = await queryDB(
        SimpleWebDB,
        typeof options.decimals === "number"
            ? `SELECT ROUND(QUANTILE_CONT("${column}", ${quantile}), ${options.decimals}) AS valueForGetQuantile FROM ${table}`
            : `SELECT QUANTILE_CONT("${column}", ${quantile}) AS valueForGetQuantile FROM ${table}`,
        mergeOptions(SimpleWebDB, {
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
    SimpleWebDB.debug && console.log("quantile:", result)
    return result as number
}
