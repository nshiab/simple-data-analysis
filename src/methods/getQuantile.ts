import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleDB from "../indexWeb.js"

export default async function getQuantile(
    simpleDB: SimpleDB,
    table: string,
    column: string,
    quantile: number,
    options: {
        decimals?: number
        debug?: boolean
    } = {}
) {
    ;(options.debug || simpleDB.debug) && console.log("\ngetQuantile()")

    const queryResult = await queryDB(
        simpleDB,
        typeof options.decimals === "number"
            ? `SELECT ROUND(QUANTILE_CONT("${column}", ${quantile}), ${options.decimals}) AS valueForGetQuantile FROM ${table}`
            : `SELECT QUANTILE_CONT("${column}", ${quantile}) AS valueForGetQuantile FROM ${table}`,
        mergeOptions(simpleDB, { ...options, table, returnDataFrom: "query" })
    )

    if (!queryResult) {
        throw new Error("No queryResults")
    }

    return queryResult[0].valueForGetQuantile
}
