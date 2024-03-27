import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleDB from "../class/SimpleDB.js"

export default async function getMedian(
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
            ? `SELECT ROUND(MEDIAN("${column}"), ${options.decimals}) AS valueForGetMedian FROM ${table}`
            : `SELECT MEDIAN("${column}") AS valueForGetMedian FROM ${table}`,
        mergeOptions(simpleDB, {
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

    simpleDB.debug && console.log("median:", result)

    return result as number
}
