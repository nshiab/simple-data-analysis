import log from "../../helpers/log.js"
import { SimpleDataItem } from "../../types/SimpleData.types.js"
import { flatRollup, mean, sum, median, max, min, deviation } from "d3-array"
import isEqual from "lodash.isequal"
import hasKey from "../../helpers/hasKey.js"
import checkTypeOfKey from "../../helpers/checkTypeOfKey.js"
import round from "../../helpers/round.js"

export default function summarize(
    data: SimpleDataItem[],
    keyValue?: string | string[],
    keyCategory?: string | string[],
    summary?: string | string[],
    weight?: string,
    nbTestedValues = 10000,
    verbose = false,
    nbDigits?: number
): SimpleDataItem[] {
    if (keyValue === undefined) {
        keyValue = Object.keys(data[0])
    }

    // Let's deal with the keyCategory first
    let keyCategories: string[] = []

    if (keyCategory === undefined) {
        verbose && log("No key provided. Data won't be grouped.")
    } else if (Array.isArray(keyCategory)) {
        for (const k of keyCategory) {
            if (!hasKey(data, k)) {
                throw new Error("No keyCategory " + k)
            }
        }
        keyCategories = keyCategory
    } else if (typeof keyCategory === "string") {
        if (!hasKey(data, keyCategory)) {
            throw new Error("No keyCategory " + keyCategory)
        }
        keyCategories = [keyCategory]
    } else {
        throw new Error(
            "keyCategory must be either a string or an array of string"
        )
    }

    // Now the values

    let keyValues: string[] = []

    if (Array.isArray(keyValue)) {
        for (const v of keyValue) {
            if (!hasKey(data, v)) {
                throw new Error("No keyValue " + v)
            }
        }
        keyValues = keyValue
    } else if (typeof keyValue === "string") {
        if (!hasKey(data, keyValue)) {
            throw new Error("No keyValue " + keyValue)
        }
        keyValues = [keyValue]
    } else {
        throw new Error(
            "keyValue must be either a string or an array of string"
        )
    }

    // And now the function to aggregate the data

    let summaries: string[] = []

    if (Array.isArray(summary)) {
        summaries = summary
    } else if (typeof summary === "string") {
        summaries = [summary]
    } else if (summary === undefined) {
        summaries = [
            "count",
            "min",
            "max",
            "sum",
            "mean",
            "median",
            "deviation",
        ]
    } else {
        throw new Error(
            'summary must be either a string or an array of string. The accepted string values are "count", "min", "max", "sum", "mean", "median", "deviation"'
        )
    }

    // We create all the function for all the values

    const summariesResults = []

    for (const value of keyValues) {
        if (
            summaries.includes("sum") ||
            summaries.includes("mean") ||
            summaries.includes("median") ||
            summaries.includes("deviation") ||
            summaries.includes("weightedMean")
        ) {
            if (
                !checkTypeOfKey(
                    data,
                    value,
                    "number",
                    1,
                    nbTestedValues,
                    verbose
                )
            ) {
                throw new Error(
                    `At least one value in ${value} is not a number. For sum, mean, median, deviation, and weightedMean, all values must be a number.`
                )
            }
        }

        for (const summary of summaries) {
            let func: (v: SimpleDataItem[]) => number | undefined
            if (summary === "count") {
                func = (v) => v.length
            } else if (summary === "min") {
                func = (v) => min(v, (d) => d[value] as number | undefined)
            } else if (summary === "max") {
                func = (v) => max(v, (d) => d[value] as number | undefined)
            } else if (summary === "sum") {
                func = (v) => sum(v, (d) => d[value] as number | undefined)
            } else if (summary === "mean") {
                func = (v) => mean(v, (d) => d[value] as number | undefined)
            } else if (summary === "median") {
                func = (v) => median(v, (d) => d[value] as number | undefined)
            } else if (summary === "deviation") {
                func = (v) =>
                    deviation(v, (d) => d[value] as number | undefined)
            } else if (summary === "weightedMean") {
                if (weight === undefined) {
                    throw new Error("Missing argument weight")
                }
                if (!hasKey(data, weight)) {
                    throw new Error("No weight " + weight)
                }
                func = (v) =>
                    sum(
                        v,
                        (d) => (d[value] as number) * (d[weight] as number)
                    ) / sum(v, (d) => d[weight] as number)
            } else {
                throw new Error(`Unknown summary name/function ${summary}`)
            }

            const keysFunc = keyCategories.map(
                (key) => (d: SimpleDataItem) => d[key]
            )

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const funcResults = flatRollup(data, func, ...keysFunc)

            const results =
                keyCategories.length === 0 ? [[funcResults]] : funcResults

            // We structure the results to have an array of objects with the value
            for (const result of results) {
                const arrayToCompare = [value].concat(
                    (result as string[]).slice(0, keyCategories.length)
                )

                const filteredResults = summariesResults.find((d) =>
                    isEqual(d.arrayToCompare, arrayToCompare)
                )

                const fValue = result[result.length - 1]
                const finalValue =
                    typeof fValue !== "number" ? NaN : round(fValue, nbDigits)

                if (filteredResults === undefined) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const itemsSummarized: any = { value: value }
                    for (let i = 0; i < keyCategories.length; i++) {
                        itemsSummarized[keyCategories[i]] = result[i]
                    }
                    itemsSummarized[summary] = finalValue

                    summariesResults.push({
                        arrayToCompare: arrayToCompare,
                        itemsSummarized: itemsSummarized,
                    })
                } else {
                    filteredResults.itemsSummarized[summary] = finalValue
                }
            }
        }
    }

    const summarizedData = summariesResults.map((d) => d.itemsSummarized)

    return summarizedData
}
