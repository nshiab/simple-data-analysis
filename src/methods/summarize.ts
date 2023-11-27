import keepNumericalColumns from "../helpers/keepNumericalColumns.js"
import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import stringToArray from "../helpers/stringToArray.js"
import SimpleDB from "../indexWeb.js"
import summarizeQuery from "./summarizeQuery.js"

export default async function summarize(
    simpleDB: SimpleDB,
    table: string,
    options: {
        outputTable?: string
        values?: string | string[]
        categories?: string | string[]
        summaries?:
            | (
                  | "count"
                  | "min"
                  | "max"
                  | "mean"
                  | "median"
                  | "sum"
                  | "skew"
                  | "stdDev"
                  | "var"
              )
            | (
                  | "count"
                  | "min"
                  | "max"
                  | "mean"
                  | "median"
                  | "sum"
                  | "skew"
                  | "stdDev"
                  | "var"
              )[]
        decimals?: number
        debug?: boolean
        returnDataFrom?: "query" | "table" | "none"
        nbRowsToLog?: number
    } = {}
) {
    ;(options.debug || simpleDB.debug) && console.log("\nsummarize()")

    const outputTable = options.outputTable ?? table

    options.values = options.values ? stringToArray(options.values) : []
    options.categories = options.categories
        ? stringToArray(options.categories)
        : []
    if (options.summaries === undefined) {
        options.summaries = []
    } else if (typeof options.summaries === "string") {
        options.summaries = [options.summaries]
    }
    options.decimals = options.decimals ?? 2

    if (options.values.length === 0) {
        const types = await simpleDB.getTypes(table)
        options.values = keepNumericalColumns(types)
    }
    options.values = options.values.filter(
        (d) => !options.categories?.includes(d)
    )

    return await queryDB(
        simpleDB,
        summarizeQuery(
            table,
            outputTable,
            options.values,
            options.categories,
            options.summaries,
            options
        ),
        mergeOptions(simpleDB, { ...options, table: outputTable })
    )
}
