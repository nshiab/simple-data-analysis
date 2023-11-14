import getCombinations from "../helpers/getCombinations.js"
import keepNumericalColumns from "../helpers/keepNumericalColumns.js"
import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import { SimpleDB } from "../indexWeb.js"
import linearRegressionQuery from "./linearRegressionQuery.js"

export default async function linearRegressions(
    simpleDB: SimpleDB,
    table: string,
    outputTable: string,
    options: {
        x?: string
        y?: string
        decimals?: number
        debug?: boolean
        nbRowsToLog?: number
        returnDataFrom?: "query" | "table" | "none"
    } = {}
) {
    ;(options.debug || simpleDB.debug) && console.log("\nlinearRegressions()")

    options.decimals = options.decimals ?? 2

    const permutations: [string, string][] = []
    if (!options.x && !options.y) {
        const types = await simpleDB.getTypes(table)
        const columns = keepNumericalColumns(types)
        const combinations = getCombinations(columns, 2)
        for (const c of combinations) {
            permutations.push(c)
            permutations.push([c[1], c[0]])
        }
    } else if (options.x && !options.y) {
        const types = await simpleDB.getTypes(table)
        const columns = keepNumericalColumns(types)
        for (const col of columns) {
            if (col !== options.x) {
                permutations.push([options.x, col])
            }
        }
    } else if (options.x && options.y) {
        permutations.push([options.x, options.y])
    } else {
        throw new Error("No combinations of x and y")
    }

    return await queryDB(
        simpleDB.connection,
        simpleDB.runQuery,
        linearRegressionQuery(table, outputTable, permutations, options),
        mergeOptions(simpleDB, { ...options, table: outputTable })
    )
}
