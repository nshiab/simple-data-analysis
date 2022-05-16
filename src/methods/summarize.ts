import log from "../helpers/log.js"
import { SimpleDataItem, Options } from "../types.js"
//@ts-ignore
import { flatRollup, mean, sum, median, max, min, deviation } from "d3-array"
import checkTypeOfKey from "../helpers/checkTypeOfKey.js"
//@ts-ignore
import isEqual from "lodash.isequal"

export default function summarize(data: SimpleDataItem[], key: any, summary: any, value: any, weight: any, options: Options): any[] {

    // Let's deal with the keys first

    let keys: any[] = []

    if (key === "no key") {

        options.logs && log("No key provided. Data won't be grouped.")

    } else if (Array.isArray(key)) {

        for (let k of key) {
            if (!data[0].hasOwnProperty(k)) {
                throw new Error("No key " + k)
            }
        }

        keys = key.filter(k => checkTypeOfKey(data, k, "string", 0.5, options))

    } else if (typeof key === "string") {

        if (!data[0].hasOwnProperty(key)) {
            throw new Error("No key " + key)
        }
        if (!checkTypeOfKey(data, key, "string", 0.5, options)) {
            throw new Error("The key values should be of type string")
        }

        keys = [key]

    } else {
        throw new Error("key must be either a string or an array of string")
    }

    //@ts-ignore
    const keysFunc = keys.map(key => d => d[key])

    // Now the values

    let values: any[] = []

    if (Array.isArray(value)) {
        for (let v of value) {
            if (!data[0].hasOwnProperty(v)) {
                throw new Error("No value " + v)
            }
        }
        values = value.filter(v => checkTypeOfKey(data, v, "number", 0.5, options))
    } else if (typeof value === "string") {
        if (!data[0].hasOwnProperty(value)) {
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

    for (let value of values) {

        for (let summary of summaries) {

            let func

            if (summary === "count") {
                //@ts-ignore
                func = v => v.length
            } else if (summary === "min") {
                //@ts-ignore
                func = v => min(v, d => d[value])
            } else if (summary === "max") {
                //@ts-ignore
                func = v => max(v, d => d[value])
            } else if (summary === "sum") {
                //@ts-ignore
                func = v => sum(v, d => d[value])
            } else if (summary === "mean") {
                //@ts-ignore
                func = v => mean(v, d => d[value])
            } else if (summary === "median") {
                //@ts-ignore
                func = v => median(v, d => d[value])
            } else if (summary === "deviation") {
                //@ts-ignore
                func = v => deviation(v, d => d[value])
            } else if (summary === "weightedMean") {

                // All items needs to have the same keys
                if (!data[0].hasOwnProperty(weight)) {
                    throw new Error("No weight " + weight)
                }
                if (!checkTypeOfKey(data, weight, "number", 0.5, options)) {
                    throw new Error("The weight should be of type number")
                }

                //@ts-ignore
                func = v => sum(v, d => d[value] * d[weight]) / sum(v, d => d[weight])

            } else {
                throw new Error(`Unknown summary name/function ${summary}`)
            }

            //@ts-ignore
            const funcResults = flatRollup(data, func, ...keysFunc)
            const results = key === "no key" || keys.length === 0 ? [[funcResults]] : funcResults

            // We structure the results to have an array of objects with the value

            for (let result of results) {

                const arrayToCompare = [value].concat(result.slice(0, keys.length))
                const filteredResults = summariesResults.find(d => isEqual(d.arrayToCompare, arrayToCompare))

                const fValue = result[result.length - 1]
                const finalValue = fValue === undefined ? NaN : parseFloat(fValue.toFixed(options.fractionDigits))

                if (filteredResults === undefined) {
                    const itemsSummarized = { value: value }
                    for (let i = 0; i < keys.length; i++) {
                        //@ts-ignore
                        itemsSummarized[keys[i]] = result[i]
                    }
                    //@ts-ignore
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