import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleWebDB from "../class/SimpleWebDB.js"

export default async function getFirstRow(
    SimpleWebDB: SimpleWebDB,
    table: string,
    options: {
        condition?: string
    } = {}
) {
    const queryResult = await queryDB(
        SimpleWebDB,
        `SELECT * FROM ${table}${
            options.condition ? ` WHERE ${options.condition}` : ""
        } LIMIT 1`,
        mergeOptions(SimpleWebDB, {
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

    SimpleWebDB.debug && console.log("first row:", result)

    return result
}
