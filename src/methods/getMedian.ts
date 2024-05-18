import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleWebDB from "../class/SimpleWebDB.js"

export default async function getMedian(
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
            ? `SELECT ROUND(MEDIAN("${column}"), ${options.decimals}) AS valueForGetMedian FROM ${table}`
            : `SELECT MEDIAN("${column}") AS valueForGetMedian FROM ${table}`,
        mergeOptions(SimpleWebDB, {
            table,
            returnDataFrom: "query",
            method: "getMedian()",
            parameters: { table, column, options },
        })
    )

    if (!queryResult) {
        throw new Error("No queryResults")
    }
    const result = queryResult[0].valueForGetMedian

    SimpleWebDB.debug && console.log("median:", result)

    return result as number
}
