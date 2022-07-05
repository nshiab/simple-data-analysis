import log from "../../helpers/log.js"
import {
    SimpleDataItem,
    SimpleDataValue,
} from "../../types/SimpleData.types.js"
import { flatRollup, mean, sum, median, max, min, deviation } from "d3-array"
import isEqual from "lodash.isequal"
import hasKey from "../../helpers/hasKey.js"

export default function summarize(
    data: SimpleDataItem[],
    keyValue?: string | string[],
    keyCategory?: string | string[],
    summary?: string | string[],
    weight?: string,
    verbose = false,
    nbDigits = 1
): any[] {
    if (keyValue === undefined) {
        keyValue = Object.keys(data[0])
    }

    // Let's deal with the keyCategory first
    let keyCategories: string[] = []

    if (keyCategory === undefined) {
        verbose && log("No key provided. Data won't be grouped.")
    } else if (Array.isArray(keyCategory)) {
        if (keyCategories.length > 3) {
            throw new Error(
                "You can specify a maximum of 3 keys in keyCategory"
            )
        }

        for (const k of keyCategory) {
            if (!hasKey(data[0], k)) {
                throw new Error("No key " + k)
            }
        }
        keyCategories = keyCategory
    } else if (typeof keyCategory === "string") {
        if (!hasKey(data[0], keyCategory)) {
            throw new Error("No key " + keyCategory)
        }
        keyCategories = [keyCategory]
    } else {
        throw new Error("key must be either a string or an array of string")
    }

    // Now the values

    let keyValues: string[] = []

    if (Array.isArray(keyValue)) {
        for (const v of keyValue) {
            if (!hasKey(data[0], v)) {
                throw new Error("No value " + v)
            }
        }
        keyValues = keyValue
    } else if (typeof keyValue === "string") {
        if (!hasKey(data[0], keyValue)) {
            throw new Error("No value " + keyValue)
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
                if (!hasKey(data[0], weight)) {
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
                    typeof fValue !== "number"
                        ? NaN
                        : parseFloat(fValue.toFixed(nbDigits))

                if (filteredResults === undefined) {
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

    console.log(summarizedData)

    return summarizedData
}
