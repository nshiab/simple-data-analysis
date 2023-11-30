import getCombinations from "../helpers/getCombinations.js"
import keepNumericalColumns from "../helpers/keepNumericalColumns.js"
import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleDB from "../indexWeb.js"
import linearRegressionQuery from "./linearRegressionQuery.js"

export default async function linearRegressions(
    simpleDB: SimpleDB,
    table: string,
    options: {
        x?: string
        y?: string
        categories?: string | string[]
        decimals?: number
        outputTable?: string
    } = {}
) {
    simpleDB.debug && console.log("\nlinearRegressions()")

    options.decimals = options.decimals ?? 2

    const outputTable = options.outputTable ?? table

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

    simpleDB.debug && console.log("permutations:", permutations)

    await queryDB(
        simpleDB,
        linearRegressionQuery(table, outputTable, permutations, options),
        mergeOptions(simpleDB, { table: outputTable })
    )
}
