import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import stringToArray from "../helpers/stringToArray.js"
import SimpleWebDB from "../class/SimpleWebDB.js"
import removeMissingQuery from "./removeMissingQuery.js"

export default async function removeMissing(
    SimpleWebDB: SimpleWebDB,
    table: string,
    options: {
        columns?: string | string[]
        missingValues?: (string | number)[]
        invert?: boolean
    } = {}
) {
    options.missingValues = options.missingValues ?? [
        "undefined",
        "NaN",
        "null",
        "NULL",
        "",
    ]

    const types = await SimpleWebDB.getTypes(table)
    const allColumns = Object.keys(types)

    options.columns = stringToArray(options.columns ?? [])

    await queryDB(
        SimpleWebDB,
        removeMissingQuery(
            table,
            allColumns,
            types,
            options.columns.length === 0 ? allColumns : options.columns,
            options
        ),
        mergeOptions(SimpleWebDB, {
            table,
            method: "removeMissing()",
            parameters: { table, options },
        })
    )
}
