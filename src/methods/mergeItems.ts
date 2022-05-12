import log from "../helpers/log.js"
import { SimpleDataItem, Options, defaultOptions } from "../types.js"
import showTable from "./showTable.js"

export default function mergeItems(data: SimpleDataItem[], key: string, func: Function, options: Options): SimpleDataItem[] {

    const start = Date.now()

    options = {
        ...defaultOptions,
        ...options
    }

    options.logs && log("\nmergeItems() " + key)
    options.logs && log(String(func))
    options.logOptions && log("options:")
    options.logOptions && log(options)

    // All items needs to have the same keys
    if (!data[0].hasOwnProperty(key)) {
        throw new Error("No key named " + key)
    }

    for (let i = 0; i < data.length; i++) {
        data[i][key] = func(data[i])
    }

    options.logs && showTable(data, options)

    const end = Date.now()
    options.logs && log(`Done in ${((end - start) / 1000).toFixed(3)} sec.`)

    return data
}