import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleDB from "../class/SimpleDB.js"

export default async function getSkew(
    simpleDB: SimpleDB,
    table: string,
    column: string,
    options: {
        decimals?: number
    } = {}
) {
    const queryResult = await queryDB(
        simpleDB,
        typeof options.decimals === "number"
            ? `SELECT ROUND(SKEWNESS("${column}"), ${options.decimals}) AS valueForGetSkew FROM ${table}`
            : `SELECT SKEWNESS("${column}") AS valueForGetSkew FROM ${table}`,
        mergeOptions(simpleDB, {
            table,
            returnDataFrom: "query",
            method: "getSkew()",
            parameters: { table, column, options },
        })
    )

    if (!queryResult) {
        throw new Error("No queryResults")
    }

    const result = queryResult[0].valueForGetSkew
    simpleDB.debug && console.log("skew:", result)
    return result
}
