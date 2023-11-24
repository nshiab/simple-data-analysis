import getCombinations from "../helpers/getCombinations.js"
import keepNumericalColumns from "../helpers/keepNumericalColumns.js"
import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import { SimpleDB } from "../indexWeb.js"
import correlationsQuery from "./correlationsQuery.js"

export default async function correlations(
    simpleDB: SimpleDB,
    table: string,
    outputTable: string,
    options: {
        x?: string
        y?: string
        decimals?: number
        order?: "asc" | "desc"
        debug?: boolean
        nbRowsToLog?: number
        returnDataFrom?: "query" | "table" | "none"
    } = {}
) {
    ;(options.debug || simpleDB.debug) && console.log("\ncorrelations()")

    options.decimals = options.decimals ?? 2

    let combinations: [string, string][] = []
    if (!options.x && !options.y) {
        const types = await simpleDB.getTypes(table)
        const columns = keepNumericalColumns(types)
        combinations = getCombinations(columns, 2)
    } else if (options.x && !options.y) {
        const types = await simpleDB.getTypes(table)
        const columns = keepNumericalColumns(types)
        combinations = []
        for (const col of columns) {
            if (col !== options.x) {
                combinations.push([options.x, col])
            }
        }
    } else if (options.x && options.y) {
        combinations = [[options.x, options.y]]
    } else {
        throw new Error("No combinations of x and y")
    }

    return await queryDB(
        simpleDB,
        correlationsQuery(table, outputTable, combinations, options),
        mergeOptions(simpleDB, { ...options, table: outputTable })
    )
}
