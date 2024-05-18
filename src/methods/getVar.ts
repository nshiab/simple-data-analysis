import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleWebDB from "../class/SimpleWebDB.js"

export default async function getVar(
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
            ? `SELECT ROUND(VARIANCE("${column}"), ${options.decimals}) AS valueForGetVar FROM ${table}`
            : `SELECT VARIANCE("${column}") AS valueForGetVar FROM ${table}`,
        mergeOptions(SimpleWebDB, {
            table,
            returnDataFrom: "query",
            method: "getVar()",
            parameters: { table, column, options },
        })
    )

    if (!queryResult) {
        throw new Error("No queryResults")
    }

    const result = queryResult[0].valueForGetVar
    SimpleWebDB.debug && console.log("variance:", result)
    return result as number
}
