import getCombinations from "../helpers/getCombinations.js"
import keepNumericalColumns from "../helpers/keepNumericalColumns.js"
import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleWebDB from "../class/SimpleWebDB.js"
import correlationsQuery from "./correlationsQuery.js"

export default async function correlations(
    SimpleWebDB: SimpleWebDB,
    table: string,
    options: {
        x?: string
        y?: string
        categories?: string | string[]
        decimals?: number
        outputTable?: string
    } = {}
) {
    SimpleWebDB.debug && console.log("\ncorrelations()")

    const outputTable = options.outputTable ?? table

    let combinations: [string, string][] = []
    if (!options.x && !options.y) {
        const types = await SimpleWebDB.getTypes(table)
        const columns = keepNumericalColumns(types)
        combinations = getCombinations(columns, 2)
    } else if (options.x && !options.y) {
        const types = await SimpleWebDB.getTypes(table)
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

    await queryDB(
        SimpleWebDB,
        correlationsQuery(table, outputTable, combinations, options),
        mergeOptions(SimpleWebDB, {
            table: outputTable,
            method: "correlations()",
            parameters: {
                table,
                options,
                "combinations (computed)": combinations,
            },
        })
    )
}
