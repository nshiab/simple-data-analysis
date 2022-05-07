import log from "../helpers/log.js"
import { SimpleDataItem, Options, defaultOptions } from "../types.js"
import showTable from "./showTable.js"
import percentage from "../helpers/percentage.js"

export default function filterItems(data: SimpleDataItem[], func: Function, options: Options): SimpleDataItem[] {

    const start = Date.now()

    options = {
        ...defaultOptions,
        ...options
    }

    options.logs && log("\nfilterItems()")
    options.logs && log(String(func))
    options.logOptions && log("options:")
    options.logOptions && log(options)

    const filteredData = data.filter(d => func(d))

    const nbRemoved = data.length - filteredData.length
    options.logs && log(`/!\\ ${nbRemoved} items removed, representing ${percentage(nbRemoved, data.length, options)} of received items.`, "bgRed")
    options.logs && showTable(filteredData, options)

    const end = Date.now()
    options.logs && log(`Done in ${((end - start) / 1000).toFixed(3)} sec.`)

    return filteredData
}