import log from "../helpers/log.js"
import { SimpleDataItem } from "../types/SimpleData.types.js"
import { flatRollup, mean, sum, median, max, min, deviation } from "d3-array"
import checkTypeOfKey from "../helpers/checkTypeOfKey.js"
import isEqual from "lodash.isequal"
import hasKey from "../helpers/hasKey.js"

export default function summarize(
    data: SimpleDataItem[],
    keyValue: string | string[],
    verbose: boolean,
    nbValuesTested: number,
    nbDigits: number,
    keyCategories?: string | string[],
    summary?: string | string[],
    weight?: string
): any[] {

    // Let's deal with the keys first

    let keys: string[] = []

    if (keyCategories === undefined) {

        verbose && log("No key provided. Data won't be grouped.")

    } else if (Array.isArray(keyCategories)) {

        for (const k of keyCategories) {
            if (!hasKey(data[0], k)) {
                throw new Error("No key " + k)
            }
        }

        keys = keyCategories.filter(k => checkTypeOfKey(data, k, "string", 0.5, verbose, nbValuesTested))

    } else if (typeof keyCategories === "string") {

        if (!hasKey(data[0], keyCategories)) {
            throw new Error("No key " + keyCategories)
        }
        if (!checkTypeOfKey(data, keyCategories, "string", 0.5, verbose, nbValuesTested)) {
            throw new Error("The key values should be of type string")
        }

        keys = [keyCategories]

    } else {
        throw new Error("key must be either a string or an array of string")
    }

    // Now the values

    let values: string[] = []

    if (Array.isArray(keyValue)) {
        for (const v of keyValue) {
            if (!hasKey(data[0], v)) {
                throw new Error("No value " + v)
            }
        }
        values = keyValue.filter(v => checkTypeOfKey(data, v, "number", 0.5, verbose, nbValuesTested))
    } else if (typeof keyValue === "string") {
        if (!hasKey(data[0], keyValue)) {
            throw new Error("No value " + keyValue)
        }
        if (!checkTypeOfKey(data, keyValue, "number", 0.5, verbose, nbValuesTested)) {
            throw new Error("The value should be of type number")
        }
        values = [keyValue]
    } else {
        throw new Error("value must be either a string or an array of string")
    }

    // And now the function to aggregate the data

    let summaries: string[] = []

    if (Array.isArray(summary)) {
        summaries = summary
    } else if (typeof summary === "string") {
        summaries = [summary]
    } else if (summary === undefined) {
        summaries = ["count", "min", "max", "sum", "mean", "median", "deviation"]
    } else {
        throw new Error("summary must be either a string or an array of string")
    }

    // We create all the function for all the values

    const summariesResults: any[] = []

    for (const value of values) {

        for (const summary of summaries) {

            let func: (v: any) => any

            if (summary === "count") {
                func = v => v.length
            } else if (summary === "min") {
                func = v => min(v, (d: any) => d[value])
            } else if (summary === "max") {
                func = v => max(v, (d: any) => d[value])
            } else if (summary === "sum") {
                func = v => sum(v, (d: any) => d[value])
            } else if (summary === "mean") {
                func = v => mean(v, (d: any) => d[value])
            } else if (summary === "median") {
                func = v => median(v, (d: any) => d[value])
            } else if (summary === "deviation") {
                func = v => deviation(v, (d: any) => d[value])
            } else if (summary === "weightedMean") {

                if (weight === undefined) {
                    throw new Error("Missing argument weight")
                }
                if (!hasKey(data[0], weight)) {
                    throw new Error("No weight " + weight)
                }
                if (!checkTypeOfKey(data, weight, "number", 0.5, verbose, nbValuesTested)) {
                    throw new Error("The weight should be of type number")
                }

                func = v => sum(v, (d: any) => d[value] * d[weight]) / sum(v, (d: any) => d[weight])

            } else {
                throw new Error(`Unknown summary name/function ${summary}`)
            }

            const keysFunc = keys.map(key => (d: SimpleDataItem) => d[key])
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const funcResults = flatRollup(data, func, ...keysFunc)
            const results = keyCategories === "no key" || keys.length === 0 ? [[funcResults]] : funcResults

            // We structure the results to have an array of objects with the value

            for (const result of results) {

                const arrayToCompare = [value].concat(result.slice(0, keys.length))
                const filteredResults = summariesResults.find(d => isEqual(d.arrayToCompare, arrayToCompare))

                const fValue = result[result.length - 1]
                const finalValue = fValue === undefined ? NaN : parseFloat(fValue.toFixed(nbDigits))

                if (filteredResults === undefined) {
                    const itemsSummarized: any = { value: value }
                    for (let i = 0; i < keys.length; i++) {
                        itemsSummarized[keys[i]] = result[i]
                    }
                    itemsSummarized[summary] = finalValue

                    summariesResults.push({
                        arrayToCompare: arrayToCompare,
                        itemsSummarized: itemsSummarized
                    })
                } else {
                    filteredResults.itemsSummarized[summary] = finalValue
                }
            }
        }
    }

    const summarizedData = summariesResults.map(d => d.itemsSummarized)

    return summarizedData
}