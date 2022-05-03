import { SimpleDataItem, Options, defaultOptions } from "../types.js"
import showTable from "./showTable.js"

export default function checkValues(data: SimpleDataItem[], options: Options): SimpleDataItem[] {

    options = {
        ...defaultOptions,
        ...options
    }

    options.logs && console.log("\ncheckValues()", options)

    options.logs && showTable(data, options)

    return data
}