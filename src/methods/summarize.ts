import log from "../helpers/log.js"
import { SimpleDataItem, Options } from "../types.js"
import { flatRollup, mean, sum, median, max, min, deviation } from "d3-array"
import checkTypeOfKey from "../helpers/checkTypeOfKey.js"
import isEqual from "lodash.isequal"
import hasKey from "../helpers/hasKey.js"

export default function summarize(data: SimpleDataItem[], key: any, summary: any, value: any, weight: any, options: Options): any[] {

    // Let's deal with the keys first

    let keys: any[] = []

    if (key === "no key") {

        options.logs && log("No key provided. Data won't be grouped.")

    } else if (Array.isArray(key)) {

        for (const k of key) {
            if (!hasKey(data[0], k)) {
                throw new Error("No key " + k)
            }
        }

        keys = key.filter(k => checkTypeOfKey(data, k, "string", 0.5, options))

    } else if (typeof key === "string") {

        if (!hasKey(data[0], key)) {
            throw new Error("No key " + key)
        }
        if (!checkTypeOfKey(data, key, "string", 0.5, options)) {
            throw new Error("The key values should be of type string")
        }

        keys = [key]

    } else {
        throw new Error("key must be either a string or an array of string")
    }

    const keysFunc = keys.map(key => (d: any) => d[key])

    // Now the values

    let values: any[] = []

    if (Array.isArray(value)) {
        for (const v of value) {
            if (!hasKey(data[0], v)) {
                throw new Error("No value " + v)
            }
        }
        values = value.filter(v => checkTypeOfKey(data, v, "number", 0.5, options))
    } else if (typeof value === "string") {
        if (!hasKey(data[0], value)) {
            throw new Error("No value " + value)
        }
        if (!checkTypeOfKey(data, value, "number", 0.5, options)) {
            throw new Error("The value should be of type number")
        }
        values = [value]
    } else {
        throw new Error("value must be either a string or an array of string")
    }

    // And now the function to aggregate the data

    let summaries: any[] = []

    if (Array.isArray(summary)) {
        summaries = summary
    } else if (typeof summary === "string") {
        summaries = [summary]
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

                if (!hasKey(data[0], weight)) {
                    throw new Error("No weight " + weight)
                }
                if (!checkTypeOfKey(data, weight, "number", 0.5, options)) {
                    throw new Error("The weight should be of type number")
                }

                func = v => sum(v, (d: any) => d[value] * d[weight]) / sum(v, (d: any) => d[weight])

            } else {
                throw new Error(`Unknown summary name/function ${summary}`)
            }

            const funcResults = flatRollup(data, func, ...keysFunc)
            const results = key === "no key" || keys.length === 0 ? [[funcResults]] : funcResults

            // We structure the results to have an array of objects with the value

            for (const result of results) {

                const arrayToCompare = [value].concat(result.slice(0, keys.length))
                const filteredResults = summariesResults.find(d => isEqual(d.arrayToCompare, arrayToCompare))

                const fValue = result[result.length - 1]
                const finalValue = fValue === undefined ? NaN : parseFloat(fValue.toFixed(options.fractionDigits))

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