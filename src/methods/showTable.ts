import { Options, SimpleDataItem, defaultOptions } from "../types.js"

export default function showTable(data: SimpleDataItem[], options: Options) {

    options = {
        ...defaultOptions,
        ...options
    }

    console.table(
        options.nbItemInTable === "all" ?
            data :
            data.slice(0, options.nbItemInTable)
    )
    typeof options.nbItemInTable === "number" && data.length - options.nbItemInTable > 0 ?
        console.log(`... and ${data.length - options.nbItemInTable} more items (total of ${data.length})`) :
        console.log(`Total of ${data.length} items`)

}