import log from "../helpers/log.js"
import { SimpleDataItem, Options, defaultOptions } from "../types.js"
import showTable from "./showTable.js"
//@ts-ignore
import { flatRollup, mean } from "d3-array"
import roundValues from "./roundValues.js"

export default function summarize(data: SimpleDataItem[], key: any, summary: any, value: string, options: Options): any[] {

    const start = Date.now()

    options = {
        ...defaultOptions,
        ...options
    }

    options.logs && log("\nsummarize " + key + " " + summary + " " + value)
    options.logOptions && log("options:")
    options.logOptions && log(options)

    // Let's deal with the keys first

    let keys: any[] = []

    if (Array.isArray(key)) {

        for (let k of key) {
            // All items needs to have the same keys
            if (!data[0].hasOwnProperty(k)) {
                throw new Error("No key " + k)
            }
        }

        keys = key

    } else if (typeof key === "string") {

        // All items needs to have the same keys
        if (!data[0].hasOwnProperty(key)) {
            throw new Error("No key " + key)
        }

        keys = [key]
    } else {
        throw new Error("key must be either a string or an array of string")
    }

    //@ts-ignore
    const keysFunc = keys.map(key => d => d[key])

    // And now the function to aggregate the data

    let summaries: any[] = []

    if (Array.isArray(summary)) {
        summaries = summary
    } else if (typeof summary === "string") {
        summaries = [summary]
    } else {
        throw new Error("summary must be either a string or an array of string")
    }

    const summariesFunc = summaries.map(d => {
        if (d === "count") {
            //@ts-ignore
            return v => v.length
        } else if (d === "mean" || d === "average") {
            //@ts-ignore
            return v => mean(v, d => d[value])
        } else {
            throw new Error(`Unknown summary name/function ${d}`)
        }
    })

    const summarizedDataRaw: any[] = []

    for (let summary of summariesFunc) {
        //@ts-ignore
        summarizedDataRaw.push(flatRollup(data, summary, ...keysFunc))

    }

    // We add the keys first
    //@ts-ignore
    const summarizedData = summarizedDataRaw[0].map(d => {
        const obj: any = {}
        for (let i = 0; i < keys.length; i++) {
            obj[keys[i]] = d[i]
        }
        return obj
    })

    // We add the aggregated values
    for (let i = 0; i < summarizedData.length; i++) {
        const item = summarizedData[i]
        for (let j = 0; j < summaries.length; j++) {
            const summary = summaries[j]
            const value = summarizedDataRaw[j][i][keys.length]
            item[summary] = value
        }
    }

    options.logs && showTable(summarizedData, options)

    const end = Date.now()
    options.logs && log(`Done in ${((end - start) / 1000).toFixed(3)} sec.`)

    return summarizedData
}