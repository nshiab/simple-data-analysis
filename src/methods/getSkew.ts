import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleWebDB from "../class/SimpleWebDB.js"

export default async function getSkew(
    SimpleWebDB: SimpleWebDB,
    table: string,
    column: string,
    options: {
        decimals?: number
    } = {}
) {
    const queryResult = await queryDB(
        SimpleWebDB,
        typeof options.decimals === "number"
            ? `SELECT ROUND(SKEWNESS("${column}"), ${options.decimals}) AS valueForGetSkew FROM ${table}`
            : `SELECT SKEWNESS("${column}") AS valueForGetSkew FROM ${table}`,
        mergeOptions(SimpleWebDB, {
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
    SimpleWebDB.debug && console.log("skew:", result)
    return result as number
}
