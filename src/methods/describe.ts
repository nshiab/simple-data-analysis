import { SimpleDataItem, Options, defaultOptions } from "../types.js"
import log from "../helpers/log.js"

export default function describe(data: SimpleDataItem[], options: Options): SimpleDataItem[] {

    const start = Date.now()

    options = {
        ...defaultOptions,
        ...options
    }

    options.logs && log("\ndescribe()")
    options.logOptions && log("options:")
    options.logOptions && log(options)
    const nbItems = data.length
    // Objects must have the same number of keys
    const nbKeys = Object.keys(data[0]).length
    const nbDataPoints = nbItems * nbKeys
    options.logs && log(`=> ${nbItems} items with ${nbKeys} keys each`, "blue")
    options.logs && log(`=> ${nbDataPoints} data points in total`, "blue")

    const end = Date.now()
    options.logs && log(`Done in ${((end - start) / 1000).toFixed(3)} sec.`)

    return data
}