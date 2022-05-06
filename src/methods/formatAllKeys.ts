import { SimpleDataItem, Options, defaultOptions } from "../types.js"
// @ts-ignore
import camelCase from "lodash.camelcase"
import showTable from "./showTable.js"
import log from "../helpers/log.js"

export default function formatAllKeys(data: SimpleDataItem[], options: Options): SimpleDataItem[] {

    options = {
        ...defaultOptions,
        ...options
    }

    options.logs && log("\nformatAllKeys()")
    options.logOptions && log("options:")
    options.logOptions && log(options)

    const keysToChange = []

    for (let i = 0; i < data.length; i++) {

        const d = data[i]

        // all items must have the same keys
        if (i === 0) {

            const keys = Object.keys(d)
            const camelCasedKeys = keys.map(d => camelCase(d))

            for (let j = 0; j < keys.length; j++) {
                if (keys[j] !== camelCasedKeys[j]) {
                    options.logs && log(`=> ${keys[j]} changed to ${camelCasedKeys[j]}`, "blue")
                    keysToChange.push({ oldKey: keys[j], newKey: camelCasedKeys[j] })
                }
            }
        }

        for (let k = 0; k < keysToChange.length; k++) {
            const oldKey = keysToChange[k].oldKey
            const newKey = keysToChange[k].newKey
            d[newKey] = d[oldKey]
            delete d[oldKey]
        }
    }

    options.logs && showTable(data, options)

    return data
}