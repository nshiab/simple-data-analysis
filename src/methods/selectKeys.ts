import log from "../helpers/log.js"
import { SimpleDataItem, Options, defaultOptions } from "../types.js"
import showTable from "./showTable.js"

export default function selectKeys(data: SimpleDataItem[], keys: string[], options: Options): SimpleDataItem[] {

    const start = Date.now()

    options = {
        ...defaultOptions,
        ...options
    }

    options.logs && log("\nselectKeys() " + keys)
    options.logOptions && log("options:")
    options.logOptions && log(options)

    for (let key of keys) {
        // All items needs to have the same keys
        if (!data[0].hasOwnProperty(key)) {
            throw new Error("No key " + key)
        }
    }

    const selectedData = []

    for (let i = 0; i < data.length; i++) {
        let obj: SimpleDataItem = {}
        for (let key of keys) {
            obj[key] = data[i][key]
        }
        selectedData.push(obj)
    }

    options.logs && showTable(selectedData, options)

    const end = Date.now()
    options.logs && log(`Done in ${((end - start) / 1000).toFixed(3)} sec.`)

    return selectedData
}