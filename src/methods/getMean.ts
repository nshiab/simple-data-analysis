import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleWebDB from "../class/SimpleWebDB.js"

export default async function getMean(
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
            ? `SELECT ROUND(AVG("${column}"), ${options.decimals}) AS valueForGetMean FROM ${table}`
            : `SELECT AVG("${column}") AS valueForGetMean FROM ${table}`,
        mergeOptions(SimpleWebDB, {
            table,
            returnDataFrom: "query",
            method: "getMean()",
            parameters: { table, column, options },
        })
    )

    if (!queryResult) {
        throw new Error("No queryResults")
    }

    const result = queryResult[0].valueForGetMean

    SimpleWebDB.debug && console.log("mean:", result)

    return result as number
}
