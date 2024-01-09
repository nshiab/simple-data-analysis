import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleDB from "../class/SimpleDB.js"

export default async function getFirstRow(
    simpleDB: SimpleDB,
    table: string,
    options: {
        condition?: string
    } = {}
) {
    const queryResult = await queryDB(
        simpleDB,
        `SELECT * FROM ${table}${
            options.condition ? ` WHERE ${options.condition}` : ""
        } LIMIT 1`,
        mergeOptions(simpleDB, {
            table,
            returnDataFrom: "query",
            method: "getFirstRow()",
            parameters: { table, options },
        })
    )
    if (!queryResult) {
        throw new Error("No queryResult")
    }

    const result = queryResult[0]

    simpleDB.debug && console.log("first row:", result)

    return result
}
