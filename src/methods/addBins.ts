import log from "../helpers/log.js"
import { SimpleDataItem, Options, defaultOptions } from "../types.js"
import showTable from "./showTable.js"
//@ts-ignore
import { extent } from "d3-array"

export default function addBins(data: SimpleDataItem[], key: string, newKey: string, nbBins: number, options: Options): SimpleDataItem[] {

    const start = Date.now()

    options = {
        ...defaultOptions,
        ...options
    }

    options.logs && log("\naddKey() " + key + " " + newKey + " " + nbBins)
    options.logOptions && log("options:")
    options.logOptions && log(options)

    // All items needs to have the same keys
    if (!data[0].hasOwnProperty(key)) {
        throw new Error("No key " + key)
    }
    if (data[0].hasOwnProperty(newKey)) {
        throw new Error("Already a key named " + key)
    }

    const values = data.map(d => d[key])
    //@ts-ignore
    const [min, max] = extent(values)
    //@ts-ignore
    const difference = max - min
    const interval = difference / nbBins

    const bins = []
    for (let i = 1; i <= nbBins; i++) {
        //@ts-ignore
        bins.push(min + i * interval)
    }

    options.logs && log("The bins values are => " + min + "," + String(bins), "blue")
    options.logs && log("/!\\The first bin is labelled 1 (not 0).", "bgRed")

    for (let i = 0; i < data.length; i++) {
        const value = data[i][key]
        for (let b = 1; b <= bins.length; b++) {
            if (value <= bins[b - 1]) {
                data[i][newKey] = b
                break
            }
        }
    }

    options.logs && showTable(data, options)

    const end = Date.now()
    options.logs && log(`Done in ${((end - start) / 1000).toFixed(3)} sec.`)

    return data
}