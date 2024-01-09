import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleDB from "../class/SimpleDB.js"

export default async function getVar(
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
            ? `SELECT ROUND(VARIANCE("${column}"), ${options.decimals}) AS valueForGetVar FROM ${table}`
            : `SELECT VARIANCE("${column}") AS valueForGetVar FROM ${table}`,
        mergeOptions(simpleDB, {
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
    simpleDB.debug && console.log("variance:", result)
    return result
}
