import log from "../helpers/log.js"
import { SimpleDataItem, Options, defaultOptions } from "../types.js"
import showTable from "./showTable.js"

export default function renameKey(data: SimpleDataItem[], oldKey: string, newKey: string, options: Options): SimpleDataItem[] {

    options = {
        ...defaultOptions,
        ...options
    }

    options.logs && log("\nrenameKey() " + oldKey + " " + newKey)
    options.logOptions && log("options:")
    options.logOptions && log(options)

    // All items needs to have the same keys
    if (!data[0].hasOwnProperty(oldKey)) {
        throw new Error("No key " + oldKey)
    }

    for (let i = 0; i < data.length; i++) {
        const d = data[i]
        d[newKey] = d[oldKey]
        delete d[oldKey]
    }

    options.logs && showTable(data, options)

    return data
}