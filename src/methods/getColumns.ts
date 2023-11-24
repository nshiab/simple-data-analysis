import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import { SimpleDB } from "../indexWeb.js"

export default async function getColumns(
    simpleDB: SimpleDB,
    table: string,
    options: {
        debug?: boolean
    } = {}
) {
    ;(options.debug || simpleDB.debug) && console.log("\ngetColumns()")

    const queryResult = await queryDB(
        simpleDB,
        `DESCRIBE ${table}`,
        mergeOptions(simpleDB, {
            ...options,
            table,
            returnDataFrom: "query",
            returnedDataModifier: (rows) => rows,
        })
    )

    if (!queryResult) {
        throw new Error("No result")
    }

    const columns = queryResult.map((d) => d.column_name) as string[]

    ;(options.debug || simpleDB.debug) && console.log("\ncolumns:", columns)

    return columns
}
