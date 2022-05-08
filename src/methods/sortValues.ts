import log from "../helpers/log.js"
import { SimpleDataItem, Options, defaultOptions } from "../types.js"
import showTable from "./showTable.js"

export default function sortValues(data: SimpleDataItem[], key: string, order: "ascending" | "descending", options: Options): SimpleDataItem[] {

    const start = Date.now()

    options = {
        ...defaultOptions,
        ...options
    }

    options.logs && log("\nsortValues() " + key + " " + order)
    options.logOptions && log("options:")
    options.logOptions && log(options)

    // All items needs to have the same keys
    if (!data[0].hasOwnProperty(key)) {
        throw new Error("No key " + key)
    }

    if (order === "ascending") {
        data.sort((a, b) => a[key] < b[key] ? -1 : 1)
    } else {
        data.sort((a, b) => a[key] < b[key] ? 1 : -1)
    }


    options.logs && showTable(data, options)

    const end = Date.now()
    options.logs && log(`Done in ${((end - start) / 1000).toFixed(3)} sec.`)

    return data
}