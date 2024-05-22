import getCombinations from "../helpers/getCombinations.js"
import keepNumericalColumns from "../helpers/keepNumericalColumns.js"
import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import correlationsQuery from "./correlationsQuery.js"
import SimpleWebTable from "../class/SimpleWebTable.js"

export default async function correlations(
    simpleWebTable: SimpleWebTable,
    options: {
        x?: string
        y?: string
        categories?: string | string[]
        decimals?: number
        outputTable?: string
    } = {}
) {
    simpleWebTable.debug && console.log("\ncorrelations()")

    const outputTable = options.outputTable ?? simpleWebTable.name

    let combinations: [string, string][] = []
    if (!options.x && !options.y) {
        const types = await simpleWebTable.getTypes()
        const columns = keepNumericalColumns(types)
        combinations = getCombinations(columns, 2)
    } else if (options.x && !options.y) {
        const types = await simpleWebTable.getTypes()
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
        simpleWebTable,
        correlationsQuery(
            simpleWebTable.name,
            outputTable,
            combinations,
            options
        ),
        mergeOptions(simpleWebTable, {
            table: outputTable,
            method: "correlations()",
            parameters: {
                options,
                "combinations (computed)": combinations,
            },
        })
    )
}
