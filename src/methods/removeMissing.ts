import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import stringToArray from "../helpers/stringToArray.js"
import removeMissingQuery from "./removeMissingQuery.js"
import SimpleWebTable from "../class/SimpleWebTable.js"

export default async function removeMissing(
    simpleWebTable: SimpleWebTable,
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

    const types = await simpleWebTable.getTypes()
    const allColumns = Object.keys(types)

    options.columns = stringToArray(options.columns ?? [])

    await queryDB(
        simpleWebTable,
        removeMissingQuery(
            simpleWebTable.name,
            allColumns,
            types,
            options.columns.length === 0 ? allColumns : options.columns,
            options
        ),
        mergeOptions(simpleWebTable, {
            table: simpleWebTable.name,
            method: "removeMissing()",
            parameters: { options },
        })
    )
}
