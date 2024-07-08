import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import stringToArray from "../helpers/stringToArray.js"
import summarizeQuery from "./summarizeQuery.js"
import SimpleWebTable from "../class/SimpleWebTable.js"

export default async function summarize(
    simpleWebTable: SimpleWebTable,
    options: {
        outputTable?: string | boolean
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
        toMs?: boolean
    } = {}
) {
    const outputTable =
        typeof options.outputTable === "string"
            ? options.outputTable
            : simpleWebTable.name

    options.values = options.values ? stringToArray(options.values) : []
    if (options.values.length === 0) {
        await simpleWebTable.addRowNumber("rowNumberToSummarizeQuerySDA")
        options.values = ["rowNumberToSummarizeQuerySDA"]
    }
    options.categories = options.categories
        ? stringToArray(options.categories)
        : []
    if (options.summaries === undefined) {
        if (
            options.values.length === 1 &&
            options.values[0] === "rowNumberToSummarizeQuerySDA"
        ) {
            options.summaries = ["count"]
        } else {
            options.summaries = []
        }
    } else if (typeof options.summaries === "string") {
        options.summaries = [options.summaries]
    }

    const types = await simpleWebTable.getTypes()
    if (options.toMs) {
        const toMsObj: {
            [key: string]: "bigint"
        } = {}
        for (const key of Object.keys(types)) {
            if (types[key].includes("TIME") || types[key].includes("DATE")) {
                toMsObj[key] = "bigint"
                types[key] = "BIGINT"
            }
        }
        await simpleWebTable.convert(toMsObj)
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

    if (options.values.includes("rowNumberToSummarizeQuerySDA")) {
        if (await simpleWebTable.hasColumn("rowNumberToSummarizeQuerySDA")) {
            await simpleWebTable.removeColumns("rowNumberToSummarizeQuerySDA")
        }
        simpleWebTable.sdb.customQuery(`UPDATE ${outputTable} SET "value" = 
                CASE
                    WHEN "value" = 'rowNumberToSummarizeQuerySDA' THEN 'rows'
                    ELSE "value"
                END;`)
    }
}
