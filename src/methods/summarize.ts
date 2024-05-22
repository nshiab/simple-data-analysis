import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import stringToArray from "../helpers/stringToArray.js"
import summarizeQuery from "./summarizeQuery.js"
import SimpleWebTable from "../class/SimpleWebTable.js"

export default async function summarize(
    simpleWebTable: SimpleWebTable,
    options: {
        outputTable?: string
        values?: string | string[]
        categories?: string | string[]
        summaries?:
            | (
                  | "count"
                  | "countUnique"
                  | "countNull"
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
                  | "countNull"
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
    const outputTable = options.outputTable ?? simpleWebTable.name

    options.values = options.values ? stringToArray(options.values) : []
    options.categories = options.categories
        ? stringToArray(options.categories)
        : []
    if (options.summaries === undefined) {
        options.summaries = []
    } else if (typeof options.summaries === "string") {
        options.summaries = [options.summaries]
    }

    const types = await simpleWebTable.getTypes()
    if (options.values.length === 0) {
        options.values = Object.keys(types)
    }

    options.values = options.values.filter(
        (d) => !options.categories?.includes(d)
    )

    await queryDB(
        simpleWebTable,
        summarizeQuery(
            simpleWebTable.name,
            types,
            outputTable,
            options.values,
            options.categories,
            options.summaries,
            options
        ),
        mergeOptions(simpleWebTable, {
            table: outputTable,
            method: "summarize()",
            parameters: {
                options,
            },
        })
    )
}
