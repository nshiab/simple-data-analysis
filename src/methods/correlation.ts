import log from "../helpers/log.js"
import { SimpleDataItem, Options, defaultOptions } from "../types.js"
import { sampleCorrelation, combinations } from "simple-statistics"
import showTable from "./showTable.js"

export default function correlation(data: SimpleDataItem[], key1?: string, key2?: string, options?: Options): any[] {

    const start = Date.now()

    options = {
        ...defaultOptions,
        ...options
    }

    options.logs && console.log("\ncorrelation() " + key1 + " " + key2)
    options.logOptions && log("options:")
    options.logOptions && log(options)

    //@ts-ignore
    const correlationData = []

    if (key1 !== undefined && key2 !== undefined) {
        if (!data[0].hasOwnProperty(key1)) {
            throw new Error(`No key ${key1} in data`)
        }
        if (!data[0].hasOwnProperty(key2)) {
            throw new Error(`No key ${key2} in data`)
        }

        const x = data.map(d => d[key1])
        const y = data.map(d => d[key2])

        const corr = sampleCorrelation(
            //@ts-ignore
            x,
            y
        )

        correlationData.push({ key1: key1, key2: key2, correlation: corr })

        if (Number.isNaN(corr)) {
            throw new Error("Correlation is NaN. Are " + key1 + " and " + key2 + " containing numbers?")
        }

    } else {
        // All items must have the same keys
        const keys = Object.keys(data[0])
        const combi = combinations(keys, 2)

        for (let c of combi) {
            const x = data.map(d => d[c[0]])
            const y = data.map(d => d[c[1]])

            const corr = sampleCorrelation(
                //@ts-ignore
                x,
                y
            )

            if (!Number.isNaN(corr)) {
                correlationData.push({ key1: c[0], key2: c[1], correlation: corr })
            }
        }

    }

    //@ts-ignore
    options.logs && showTable(correlationData, options)

    const end = Date.now()
    options.logs && log(`Done in ${((end - start) / 1000).toFixed(3)} sec.`)

    //@ts-ignore
    return correlationData
}