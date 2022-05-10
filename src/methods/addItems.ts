import log from "../helpers/log.js"
import { SimpleDataItem, Options, defaultOptions } from "../types.js"
import showTable from "./showTable.js"
//@ts-ignore
import isEqual from "lodash.isequal"

export default function addItems(data: SimpleDataItem[], dataToBeAdded: SimpleDataItem[], options: Options): SimpleDataItem[] {

    const start = Date.now()

    options = {
        ...defaultOptions,
        ...options
    }

    options.logs && log("\naddItems()")
    options.logOptions && log("options:")
    options.logOptions && log(options)

    // All items needs to have the same keys in all SimpleData elements
    const keys1 = Object.keys(data[0]).sort()
    const keys2 = Object.keys(dataToBeAdded[0]).sort()

    if (!isEqual(keys1, keys2)) {
        throw new Error(`data and dataToBeAdded don't have the same keys\ndata keys => ${String(keys1)}\ndataToBeAdded keys => ${String(keys2)}`)
    }

    const newData = data.concat(dataToBeAdded)

    options.logs && showTable(newData, options)

    const end = Date.now()
    options.logs && log(`Done in ${((end - start) / 1000).toFixed(3)} sec.`)

    return newData
}