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
    simpleDB.debug && console.log("\ngetFirstRow()")
    simpleDB.debug && console.log("parameters:", { table, options })

    const queryResult = await queryDB(
        simpleDB,
        `SELECT * FROM ${table}${
            options.condition ? ` WHERE ${options.condition}` : ""
        } LIMIT 1`,
        mergeOptions(simpleDB, { table, returnDataFrom: "query" })
    )
    if (!queryResult) {
        throw new Error("No queryResult")
    }

    return queryResult[0]
}
