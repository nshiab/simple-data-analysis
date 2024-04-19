import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import stringToArray from "../helpers/stringToArray.js"
import SimpleDB from "../class/SimpleDB.js"
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
                  | "countUnique"
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
                  | "countUnique"
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
    } = {}
) {
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

    const types = await simpleDB.getTypes(table)
    if (options.values.length === 0) {
        options.values = Object.keys(types)
    }

    options.values = options.values.filter(
        (d) => !options.categories?.includes(d)
    )

    return await queryDB(
        simpleDB,
        summarizeQuery(
            table,
            types,
            outputTable,
            options.values,
            options.categories,
            options.summaries,
            options
        ),
        mergeOptions(simpleDB, {
            table: outputTable,
            method: "summarize()",
            parameters: {
                table,
                options,
            },
        })
    )
}
