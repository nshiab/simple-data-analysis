import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleWebDB from "../class/SimpleWebDB.js"

export default async function getStdDev(
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
            ? `SELECT ROUND(STDDEV("${column}"), ${options.decimals}) AS valueForGetStdDev FROM ${table}`
            : `SELECT STDDEV("${column}") AS valueForGetStdDev FROM ${table}`,
        mergeOptions(SimpleWebDB, {
            table,
            returnDataFrom: "query",
            method: "getStdDev()",
            parameters: { table, column, options },
        })
    )

    if (!queryResult) {
        throw new Error("No queryResults")
    }

    const result = queryResult[0].valueForGetStdDev
    SimpleWebDB.debug && console.log("Standard deviation:", result)
    return result as number
}
