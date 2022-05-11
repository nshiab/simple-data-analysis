import log from "../helpers/log.js"
import { SimpleDataItem, Options, defaultOptions } from "../types.js"
import { sampleCorrelation, combinations } from "simple-statistics"
import showTable from "./showTable.js"
import checkTypeOfKey from "../helpers/checkTypeOfKey.js"

export default function correlation(data: SimpleDataItem[], key1?: string, key2?: string, options?: Options): any[] {

    const start = Date.now()

    options = {
        ...defaultOptions,
        ...options
    }

    options.logs && console.log("\ncorrelation() " + key1 + " " + key2)
    options.logOptions && log("options:")
    options.logOptions && log(options)

    const correlations = []

    if (key1 === undefined && key2 === undefined) {

        // All items must have the same keys
        //@ts-ignore
        const keys = Object.keys(data[0]).filter(d => checkTypeOfKey(data, d, "number", 1, options))
        const combi = combinations(keys, 2)

        for (let c of combi) {
            correlations.push({
                key1: c[0],
                key2: c[1]
            })
        }

    } else if (typeof key1 === "string" && Array.isArray(key2)) {

        //@ts-ignore
        if (!data[0].hasOwnProperty(key1)) {
            throw new Error(`No key ${key1} in data`)
        }
        if (!checkTypeOfKey(data, key1, "number", 1, options)) {
            throw new Error(`${key1} should be of type number`)
        }

        for (let key of key2) {
            if (!data[0].hasOwnProperty(key)) {
                throw new Error(`No key ${key} in data`)
            }
            if (!checkTypeOfKey(data, key, "number", 1, options)) {
                throw new Error(`${key} should be of type number`)
            }
            correlations.push({
                key1: key1,
                key2: key
            })
        }
    } else if (typeof key1 === "string" && typeof key2 === "string") {
        //@ts-ignore
        if (!data[0].hasOwnProperty(key1)) {
            throw new Error(`No key ${key1} in data`)
        }
        if (!checkTypeOfKey(data, key1, "number", 1, options)) {
            throw new Error(`${key1} should be of type number`)
        }
        if (!data[0].hasOwnProperty(key2)) {
            throw new Error(`No key ${key2} in data`)
        }
        if (!checkTypeOfKey(data, key2, "number", 1, options)) {
            throw new Error(`${key2} should be of type number`)
        }
        correlations.push({
            key1: key1,
            key2: key2
        })
    } else {
        throw new Error("key1 should be a string and key2 should be a string or array of strings")
    }

    const correlationData = []

    for (let corr of correlations) {

        const x = data.map(d => d[corr.key1])
        const y = data.map(d => d[corr.key2])

        const result = sampleCorrelation(
            //@ts-ignore
            x,
            y
        )

        correlationData.push({
            ...corr,
            correlation: Number.isNaN(result) ? NaN : parseFloat(result.toFixed(options.fractionDigits))
        })
    }

    //@ts-ignore
    options.logs && showTable(correlationData, options)

    const end = Date.now()
    options.logs && log(`Done in ${((end - start) / 1000).toFixed(3)} sec.`)

    //@ts-ignore
    return correlationData
}