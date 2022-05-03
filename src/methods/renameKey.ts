import { SimpleDataItem, Options, defaultOptions } from "../types.js"
import showTable from "./showTable.js"

export default function renameKey(data: SimpleDataItem[], oldKey: string, newKey: string, options: Options): SimpleDataItem[] {

    options = {
        ...defaultOptions,
        ...options
    }

    options.logs && console.log("\nrenameKey()", oldKey, newKey, options)

    for (let i = 0; i < data.length; i++) {
        const d = data[i]
        d[newKey] = d[oldKey]
        delete d[oldKey]
    }

    options.logs && showTable(data, options)

    return data
}